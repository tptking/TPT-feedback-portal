import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ShieldCheck, LogIn, AlertCircle } from 'lucide-react';

export default function FacultyLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please enter both Username and Password');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Authenticate with Supabase Auth
      // The prompt specified "Faculty authentication: Username + Password" 
      // Supabase uses Email + Password by default, so we assume the username maps to an email 
      // OR we just use standard signInWithPassword assuming the username is the email.
      // For this implementation, we will append a dummy domain if it's just a username
      const email = username.includes('@') ? username : `${username}@tpt.edu.in`;

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        setError('Invalid Username or Password');
        setLoading(false);
        return;
      }

      // Step 2: Verify the user is a faculty member
      const { data: facultyData, error: facultyError } = await supabase
        .from('faculty')
        .select('*')
        .eq('auth_user_id', authData.user.id)
        .single();

      if (facultyError || !facultyData) {
        setError('Unauthorised Access: Not a faculty member');
        await supabase.auth.signOut();
      } else {
        navigate('/faculty/dashboard');
      }
    } catch (err) {
      setError('Invalid Username or Password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-indigo-600 p-3 rounded-full">
            <ShieldCheck className="h-12 w-12 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          FACULTY PORTAL
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          TPT Faculty Feedback Assessment System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-t-4 border-indigo-600">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Authenticating...' : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    SECURE LOGIN
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
             <a href="/student/login" className="text-sm text-indigo-600 hover:text-indigo-500">
               &larr; Back to Student Login
             </a>
          </div>
        </div>
      </div>
    </div>
  );
}
