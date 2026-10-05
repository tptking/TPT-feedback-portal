import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// If we have real credentials, use the real Supabase client
const hasRealCredentials = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_url';

export const realSupabase = hasRealCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// LOCAL DATABASE MOCK ENGINE (FALLBACK)
// ==========================================
// This automatically takes over if the user hasn't provided Supabase keys yet,
// ensuring the application works perfectly offline/locally!

const mockStudents = [
  { id: '1', register_number: 'A2407008', student_name: 'Abinay Krishna A', department_id: '6', year: 3, section: 'A' },
  { id: '2', register_number: 'A2407009', student_name: 'Abishek R M', department_id: '6', year: 3, section: 'A' },
  { id: '3', register_number: 'A2407010', student_name: 'Abishek Krish M', department_id: '6', year: 3, section: 'A' },
  { id: '66', register_number: 'A2407066', student_name: 'Vipul N M', department_id: '6', year: 3, section: 'A' }
];

const mockFaculty = [
  { id: 'f1', auth_user_id: 'auth-1', faculty_name: 'Mrs.R.Sangeetha', username: 'sangeetha', department_id: '6' }
];

class MockSupabaseClient {
  auth = {
    signInWithPassword: async ({ email, password }: { email: string; password?: string }) => {
      // Mock faculty login
      if (email.startsWith('sangeetha')) {
        return { data: { user: { id: 'auth-1', email } }, error: null };
      }
      return { data: { user: null }, error: new Error('Invalid login') };
    },
    signOut: async () => ({ error: null })
  };

  from(table: string) {
    return {
      select: (query: string = '*') => {
        return {
          eq: (column: string, value: string) => {
            return {
              single: async () => {
                // Mock Student Login Validation
                if (table === 'students' && column === 'register_number') {
                  // Accept any register number that starts with A24 or C25 for the mock
                  if (value.startsWith('A24') || value.startsWith('C25')) {
                    const student = mockStudents.find(s => s.register_number === value) || {
                      id: Math.random().toString(),
                      register_number: value,
                      student_name: 'Mock Student',
                      department_id: '6',
                      year: 3,
                      section: 'A'
                    };
                    return { data: student, error: null };
                  }
                  return { data: null, error: new Error('Student not found') };
                }
                
                // Mock Faculty Data Retrieval
                if (table === 'faculty' && column === 'auth_user_id') {
                  const faculty = mockFaculty.find(f => f.auth_user_id === value);
                  if (faculty) return { data: faculty, error: null };
                  return { data: null, error: new Error('Faculty not found') };
                }

                return { data: null, error: new Error('Not implemented in mock') };
              }
            };
          }
        };
      }
    };
  }
}

// Export the real client if available, otherwise seamlessly export the mock engine!
export const supabase = (hasRealCredentials ? realSupabase : new MockSupabaseClient()) as any;
