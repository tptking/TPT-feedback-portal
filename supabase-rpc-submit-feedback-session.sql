-- ==============================================================================
-- Migration: Atomic Student Feedback Session Submission RPC
-- File: supabase-rpc-submit-feedback-session.sql
-- Description:
--   Saves a student's complete feedback session atomically in a single PostgreSQL
--   transaction. Ensures all assigned courses and faculty members are validated,
--   all 10 questions per evaluation are answered with valid ratings (1-5), and
--   prevents duplicate or partial submissions.
--
-- DO NOT EXECUTE IN PRODUCTION WITHOUT EXPLICIT USER APPROVAL.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.submit_feedback_session(
    p_student_id UUID,
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
    v_existing_count INTEGER;
    v_required_assignments_count INTEGER;
    v_evaluations_count INTEGER;
BEGIN
    -- 1. Validate Student existence and status
    SELECT id, register_number, department_id, year, semester, section, active
    INTO v_student
    FROM students
    WHERE id = p_student_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Student record not found.'
        );
    END IF;

    IF v_student.active IS NOT TRUE THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Student record is inactive.'
        );
    END IF;

    IF v_student.department_id <> p_department_id THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Student department does not match the submission department.'
        );
    END IF;

    -- 2. Validate Feedback Cycle
    SELECT id, department_id, year, enabled
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
            'error', 'Feedback cycle is currently disabled.'
        );
    END IF;

    IF v_cycle.department_id <> v_student.department_id OR v_cycle.year <> v_student.year THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Feedback cycle does not match student year or department.'
        );
    END IF;

    -- 3. Verify that the evaluations payload is an array
    IF jsonb_typeof(p_evaluations) <> 'array' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid evaluations payload: expected an array.'
        );
    END IF;

    v_evaluations_count := jsonb_array_length(p_evaluations);
    IF v_evaluations_count = 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Evaluations list cannot be empty.'
        );
    END IF;

    -- 4. Verify all required faculty subject assignments for this student are represented
    SELECT COUNT(*)
    INTO v_required_assignments_count
    FROM faculty_subject_assignments
    WHERE department_id = v_student.department_id
      AND year = v_student.year
      AND semester = v_student.semester
      AND section = v_student.section
      AND active = true;

    IF v_evaluations_count <> v_required_assignments_count THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', format('Submission contains %s evaluations, but student requires %s assigned evaluations.', v_evaluations_count, v_required_assignments_count)
        );
    END IF;

    -- 5. Check whether any feedback response already exists for this student in this cycle
    SELECT COUNT(*)
    INTO v_existing_count
    FROM feedback_responses
    WHERE student_id = p_student_id
      AND feedback_cycle_id = p_feedback_cycle_id;

    IF v_existing_count > 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Feedback has already been submitted for this cycle.'
        );
    END IF;

    -- 6. Atomically process and insert each evaluation and its 10 answers
    FOR v_eval IN SELECT * FROM jsonb_array_elements(p_evaluations)
    LOOP
        v_subject_id := (v_eval->>'subject_id')::UUID;
        v_faculty_id := (v_eval->>'faculty_id')::UUID;

        -- Verify assignment is genuinely active and assigned to student
        IF NOT EXISTS (
            SELECT 1 FROM faculty_subject_assignments
            WHERE department_id = v_student.department_id
              AND year = v_student.year
              AND semester = v_student.semester
              AND section = v_student.section
              AND subject_id = v_subject_id
              AND faculty_id = v_faculty_id
              AND active = true
        ) THEN
            RAISE EXCEPTION 'Invalid assignment in submission: Subject % with Faculty % is not assigned to this student.', v_subject_id, v_faculty_id;
        END IF;

        -- Verify answers count equals 10
        IF jsonb_array_length(v_eval->'answers') <> 10 THEN
            RAISE EXCEPTION 'Evaluation for subject % must have exactly 10 answered questions.', v_subject_id;
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

        -- Insert each of the 10 answer rows
        FOR v_ans IN SELECT * FROM jsonb_array_elements(v_eval->'answers')
        LOOP
            v_question_id := (v_ans->>'question_id')::UUID;
            v_rating_value := (v_ans->>'rating_value')::INTEGER;
            v_selected_option := COALESCE(v_ans->>'selected_option', '');

            -- Validate rating value is strictly 1 to 5
            IF v_rating_value < 1 OR v_rating_value > 5 THEN
                RAISE EXCEPTION 'Invalid rating value % for question %. Must be between 1 and 5.', v_rating_value, v_question_id;
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
        'responses_created', v_inserted_responses,
        'answers_created', v_inserted_answers
    );
EXCEPTION
    WHEN OTHERS THEN
        -- Transaction automatically aborts on RAISE EXCEPTION
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Grant execution permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.submit_feedback_session(UUID, UUID, UUID, JSONB) TO anon, authenticated;
