import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GraduationCap, LogIn, AlertCircle } from 'lucide-react';

export default function StudentLogin() {
  const [registerNumber, setRegisterNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!registerNumber.trim()) {
      setError('Please enter a Register Number');
      return;
    }

    setLoading(true);

    try {
      const { data, error: fetchError } = await supabase
        .from('students')
        .select('*')
        .eq('register_number', registerNumber.trim())
        .single();

      if (fetchError || !data) {
        setError('Invalid Register Number');
      } else {
        // Successful login
        // In a real application we would set auth state/context
        // For now, we will store the student in local/session storage to use in dashboard
        sessionStorage.setItem('student_data', JSON.stringify(data));
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError('Invalid Register Number');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-blue-600 p-3 rounded-full">
            <GraduationCap className="h-12 w-12 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          TPT FACULTY FEEDBACK
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Thiagarajar Polytechnic College, Salem
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="registerNumber" className="block text-sm font-medium text-gray-700">
                Register Number
              </label>
              <div className="mt-1">
                <input
                  id="registerNumber"
                  name="registerNumber"
                  type="text"
                  required
                  placeholder="e.g. A2407066"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm uppercase"
                  value={registerNumber}
                  onChange={(e) => setRegisterNumber(e.target.value.toUpperCase())}
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
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    LOGIN
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
             <a href="/faculty/login" className="text-sm text-blue-600 hover:text-blue-500">
               Faculty Login &rarr;
             </a>
          </div>
        </div>
      </div>
    </div>
  );
}
