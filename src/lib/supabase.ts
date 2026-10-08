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
  { id: 'f1', auth_user_id: 'auth-1', faculty_name: 'Civil Engineering Admin', username: 'civildept', department_id: '1' },
  { id: 'f2', auth_user_id: 'auth-2', faculty_name: 'Mechanical Engineering Admin', username: 'mechdept', department_id: '2' },
  { id: 'f3', auth_user_id: 'auth-3', faculty_name: 'Electrical & Electronics Admin', username: 'eeedept', department_id: '3' },
  { id: 'f4', auth_user_id: 'auth-4', faculty_name: 'Production Engineering Admin', username: 'proddept', department_id: '4' },
  { id: 'f5', auth_user_id: 'auth-5', faculty_name: 'Textile Technology Admin', username: 'textiledept', department_id: '5' },
  { id: 'f6', auth_user_id: 'auth-6', faculty_name: 'Computer Engineering Admin', username: 'computerdept', department_id: '6' },
  { id: 'f7', auth_user_id: 'auth-7', faculty_name: 'CS & IT Admin', username: 'csitdept', department_id: '7' },
  { id: 'f8', auth_user_id: 'auth-8', faculty_name: 'Electronics & Communication Admin', username: 'ecedept', department_id: '8' },
  { id: 'f9', auth_user_id: 'auth-9', faculty_name: 'Architecture Admin', username: 'archdept', department_id: '9' },
  { id: 'f10', auth_user_id: 'auth-10', faculty_name: 'AI & ML Admin', username: 'aimldept', department_id: '10' }
];

class MockSupabaseClient {
  auth = {
    signInWithPassword: async ({ email }: { email: string; password?: string }) => {
      // Mock faculty login
      const username = email.split('@')[0];
      const fac = mockFaculty.find(f => f.username === username);
      if (fac) {
        return { data: { user: { id: fac.auth_user_id, email } }, error: null };
      }
      return { data: { user: null }, error: new Error('Invalid login') };
    },
    signOut: async () => ({ error: null })
  };

  from(table: string) {
    return {
      select: (_query: string = '*') => {
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
