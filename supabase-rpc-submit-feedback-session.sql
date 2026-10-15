-- ==============================================================================
-- DEPRECATED FILE - DO NOT RUN DIRECTLY IN PRODUCTION
-- ==============================================================================
-- WARNING: This file is kept only for backwards compatibility.
-- The authoritative, active version is located in:
--   supabase/migrations/20261014000000_atomic_feedback_submission.sql
--
-- DO NOT EXECUTE IN PRODUCTION WITHOUT EXPLICIT USER APPROVAL.
-- All database updates must be applied via Supabase migrations.
-- ==============================================================================

-- 1. Create or replace the atomic submission function
CREATE OR REPLACE FUNCTION public.submit_feedback_session(
    p_student_id UUID,
    p_register_number TEXT,
    p_feedback_cycle_id UUID,
    p_department_id UUID,
    p_evaluations JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_student RECORD;
    v_cycle RECORD;
    v_eval JSONB;
    v_ans JSONB;
    v_subject_id UUID;
    v_faculty_id UUID;
    v_response_id UUID;
    v_question_id UUID;
    v_rating_value INTEGER;
    v_selected_option TEXT;
    v_inserted_responses INTEGER := 0;
    v_inserted_answers INTEGER := 0;
    v_existing_responses_count INTEGER;
    v_existing_answers_count INTEGER;
    v_required_assignments_count INTEGER;
    v_evaluations_count INTEGER;
    v_active_questions_count INTEGER;
BEGIN
    -- 0. Concurrency Protection: Acquire transaction-level advisory lock scoped to this student and cycle.
    -- Ensures simultaneous duplicate requests (e.g., rapid double-clicks) serialize cleanly without duplicate key errors;
    -- the second transaction waits and then smoothly returns the idempotent success response.
    PERFORM pg_advisory_xact_lock(hashtext(p_student_id::text || ':' || p_feedback_cycle_id::text));

    -- Determine active questions count dynamically
    SELECT COUNT(*)
    INTO v_active_questions_count
    FROM feedback_questions
    WHERE active = true;

    IF v_active_questions_count = 0 THEN
        v_active_questions_count := 10;
    END IF;

    -- 1. Validate Student existence, register number, and active status
    SELECT id, register_number, department_id, batch_id, year, semester, section, active
    INTO v_student
    FROM students
    WHERE id = p_student_id
      AND UPPER(TRIM(register_number)) = UPPER(TRIM(p_register_number));

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Student verification failed: invalid student ID or register number.'
        );
    END IF;

    IF v_student.active IS NOT TRUE THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Student record is inactive. Please contact the administrator.'
        );
    END IF;

    IF v_student.department_id <> p_department_id THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Department mismatch: student does not belong to the submitted department.'
        );
    END IF;

    -- 2. Validate Feedback Cycle
    SELECT id, department_id, year, semester, section, enabled, start_date, end_date
    INTO v_cycle
    FROM feedback_cycles
    WHERE id = p_feedback_cycle_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Feedback cycle not found.'
        );
    END IF;

    IF v_cycle.enabled IS NOT TRUE THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'This feedback cycle is currently closed or inactive.'
        );
    END IF;

    IF v_cycle.department_id <> v_student.department_id OR v_cycle.year <> v_student.year THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Feedback cycle does not match student year or department.'
        );
    END IF;

    -- 3. Verify evaluations payload is a non-empty array
    IF jsonb_typeof(p_evaluations) <> 'array' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid evaluations payload: expected a JSON array.'
        );
    END IF;

    v_evaluations_count := jsonb_array_length(p_evaluations);
    IF v_evaluations_count = 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Evaluations list cannot be empty.'
        );
    END IF;

    -- 4. Count required active assignments for this student
    -- Strict section matching:
    --   - If assignment specifies a section, it must match student's section identically.
    --   - If assignment has NULL/empty section, it is a whole-batch course for all sections.
    --   - Never mixes across different sections (e.g. section A students cannot receive section B courses).
    SELECT COUNT(*)
    INTO v_required_assignments_count
    FROM faculty_subject_assignments a
    WHERE a.department_id = v_student.department_id
      AND a.year = v_student.year
      AND a.semester = v_student.semester
      AND (
          (a.section IS NOT NULL AND TRIM(a.section) <> '' AND v_student.section IS NOT NULL AND UPPER(TRIM(a.section)) = UPPER(TRIM(v_student.section)))
          OR
          (a.section IS NULL OR TRIM(a.section) = '')
      )
      AND a.active = true;

    IF v_required_assignments_count = 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'No active faculty subject assignments found for your department, year, semester, and section.'
        );
    END IF;

    IF v_evaluations_count <> v_required_assignments_count THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', format('Submission contains %s evaluations, but student requires %s assigned evaluations.', v_evaluations_count, v_required_assignments_count)
        );
    END IF;

    -- 5. Idempotency Check: check if already fully submitted in this cycle
    SELECT COUNT(DISTINCT r.id), COUNT(a.id)
    INTO v_existing_responses_count, v_existing_answers_count
    FROM feedback_responses r
    LEFT JOIN feedback_answers a ON r.id = a.response_id
    WHERE r.student_id = p_student_id
      AND r.feedback_cycle_id = p_feedback_cycle_id;

    -- If all responses and answers already exist, return idempotency success
    IF v_existing_responses_count >= v_evaluations_count AND v_existing_answers_count >= (v_evaluations_count * v_active_questions_count) THEN
        RETURN jsonb_build_object(
            'success', true,
            'already_submitted', true,
            'message', 'Feedback was already successfully submitted for this cycle.'
        );
    END IF;

    -- If orphaned partial responses exist from an interrupted legacy/broken attempt, clean them up internally
    -- (Executed within trusted SECURITY DEFINER context; never exposed to anonymous client DELETE calls)
    IF v_existing_responses_count > 0 AND v_existing_answers_count < (v_evaluations_count * v_active_questions_count) THEN
        DELETE FROM feedback_responses
        WHERE student_id = p_student_id
          AND feedback_cycle_id = p_feedback_cycle_id;
    END IF;

    -- 6. Atomically process and insert each evaluation and its answers
    FOR v_eval IN SELECT * FROM jsonb_array_elements(p_evaluations)
    LOOP
        v_subject_id := (v_eval->>'subject_id')::UUID;
        v_faculty_id := (v_eval->>'faculty_id')::UUID;

        -- Verify assignment exists, is active, and matches student's section criteria
        IF NOT EXISTS (
            SELECT 1 FROM faculty_subject_assignments a
            WHERE a.department_id = v_student.department_id
              AND a.year = v_student.year
              AND a.semester = v_student.semester
              AND (
                  (a.section IS NOT NULL AND TRIM(a.section) <> '' AND v_student.section IS NOT NULL AND UPPER(TRIM(a.section)) = UPPER(TRIM(v_student.section)))
                  OR
                  (a.section IS NULL OR TRIM(a.section) = '')
              )
              AND a.subject_id = v_subject_id
              AND a.faculty_id = v_faculty_id
              AND a.active = true
        ) THEN
            RAISE EXCEPTION 'Invalid assignment in submission: Subject % with Faculty % is not assigned to student % in section %.',
                v_subject_id, v_faculty_id, p_register_number, COALESCE(v_student.section, 'N/A');
        END IF;

        -- Verify all active questions answered per evaluation
        IF jsonb_array_length(v_eval->'answers') <> v_active_questions_count THEN
            RAISE EXCEPTION 'Evaluation for subject % must have exactly % answered questions.', v_subject_id, v_active_questions_count;
        END IF;

        -- Insert response row
        INSERT INTO feedback_responses (
            student_id,
            faculty_id,
            subject_id,
            department_id,
            feedback_cycle_id,
            status,
            submitted_at
        ) VALUES (
            p_student_id,
            v_faculty_id,
            v_subject_id,
            p_department_id,
            p_feedback_cycle_id,
            'COMPLETED',
            NOW()
        )
        RETURNING id INTO v_response_id;

        v_inserted_responses := v_inserted_responses + 1;

        -- Insert all answers for this evaluation
        FOR v_ans IN SELECT * FROM jsonb_array_elements(v_eval->'answers')
        LOOP
            v_question_id := (v_ans->>'question_id')::UUID;
            v_rating_value := (v_ans->>'rating_value')::INTEGER;
            v_selected_option := COALESCE(v_ans->>'selected_option', '');

            -- Validate rating value is strictly between 1 and 5
            IF v_rating_value < 1 OR v_rating_value > 5 THEN
                RAISE EXCEPTION 'Invalid rating value % for question %. Must be an integer between 1 and 5.', v_rating_value, v_question_id;
            END IF;

            INSERT INTO feedback_answers (
                response_id,
                question_id,
                rating_value,
                selected_option
            ) VALUES (
                v_response_id,
                v_question_id,
                v_rating_value,
                v_selected_option
            );

            v_inserted_answers := v_inserted_answers + 1;
        END LOOP;
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'already_submitted', false,
        'responses_created', v_inserted_responses,
        'answers_created', v_inserted_answers
    );
EXCEPTION
    WHEN OTHERS THEN
        -- PostgreSQL automatically rolls back the entire transaction upon exception
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Grant execution permission to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.submit_feedback_session(UUID, TEXT, UUID, UUID, JSONB) TO anon, authenticated;
