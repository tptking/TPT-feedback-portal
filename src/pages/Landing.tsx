import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GraduationCap, User, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Landing() {
  const [loginType, setLoginType] = useState<'student' | 'faculty'>('student');
  const [registerNumber, setRegisterNumber] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!registerNumber.trim()) {
      setError('Please enter a Register Number');
      return;
    }

    setLoading(true);

    try {
      // If the user hasn't set up the .env file, supabaseUrl will be the dummy one, which fails.
      const { data, error: fetchError } = await supabase
        .from('students')
        .select('*')
        .eq('register_number', registerNumber.trim())
        .single();

      if (fetchError || !data) {
        setError('Invalid Register Number (or Database not connected)');
      } else {
        sessionStorage.setItem('student_data', JSON.stringify(data));
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError('Invalid Register Number (or Database not connected)');
    } finally {
      setLoading(false);
    }
  };

  const handleFacultyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please enter both Username and Password');
      return;
    }

    setLoading(true);

    try {
      const email = username.includes('@') ? username : `${username}@tpt.edu.in`;

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        setError('Invalid Username/Password (or Database not connected)');
        setLoading(false);
        return;
      }

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
      setError('Invalid Username/Password (or Database not connected)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Top Header Logo Only */}
      <div className="w-full max-w-[400px] flex items-center justify-center mb-12">
        <div className="w-20 h-20">
           <img 
              src="https://www.tpt.edu.in/assets/images/logo.jpg" 
              alt="TPT Logo" 
              className="w-full h-full object-contain rounded-md"
            />
        </div>
      </div>

      <div className="w-full max-w-[400px]">
        {/* Title and Subtitle */}
        <div className="text-center mb-8">
          <h2 className="text-[32px] font-bold text-gray-900 mb-2 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-[15px] text-gray-400 font-medium">
            Welcome Back, Please enter Your details
          </p>
        </div>

        {/* Toggle Switch Container */}
        <div className="bg-[#F3F4F6] p-1.5 rounded-[20px] flex mb-8">
          <button
            type="button"
            onClick={() => { setLoginType('student'); setError(''); }}
            className={`flex-1 py-3 text-[15px] font-semibold rounded-[16px] transition-all duration-300 ${
              loginType === 'student' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => { setLoginType('faculty'); setError(''); }}
            className={`flex-1 py-3 text-[15px] font-semibold rounded-[16px] transition-all duration-300 ${
              loginType === 'faculty' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Faculty
          </button>
        </div>

        {/* Forms */}
        {loginType === 'student' ? (
          <form className="space-y-5 animate-fade-in" onSubmit={handleStudentLogin}>
            
            {/* Custom Input Field with Icon, Divider, Label inside */}
            <div className="relative flex items-center bg-white border border-gray-200 rounded-[20px] p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all shadow-sm">
              <div className="pl-4 pr-3 flex items-center justify-center">
                <div className="p-2 border border-gray-200 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-gray-800" strokeWidth={2.5} />
                </div>
              </div>
              <div className="h-10 w-px bg-gray-200 mx-2"></div>
              <div className="flex-1 flex flex-col justify-center px-2 py-1">
                <label htmlFor="registerNumber" className="text-[12px] font-medium text-gray-400">
                  Register Number
                </label>
                <input
                  id="registerNumber"
                  name="registerNumber"
                  type="text"
                  required
                  placeholder="e.g. A2407066"
                  className="w-full bg-transparent text-gray-900 font-semibold text-[15px] placeholder-gray-300 focus:outline-none uppercase"
                  value={registerNumber}
                  onChange={(e) => setRegisterNumber(e.target.value.toUpperCase())}
                />
              </div>
              {registerNumber.length > 5 && (
                <div className="pr-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center text-red-500 text-sm font-medium px-2">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 py-4 px-4 rounded-[20px] shadow-[0_8px_20px_rgb(37,99,235,0.2)] text-[16px] font-semibold text-white bg-[#0D6EFD] hover:bg-blue-600 focus:outline-none transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Continue'}
            </button>
          </form>
        ) : (
          <form className="space-y-4 animate-fade-in" onSubmit={handleFacultyLogin}>
            
            {/* Custom Username Input */}
            <div className="relative flex items-center bg-white border border-gray-200 rounded-[20px] p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all shadow-sm">
              <div className="pl-4 pr-3 flex items-center justify-center">
                <div className="p-2 border border-gray-200 rounded-lg">
                  <User className="w-5 h-5 text-gray-800" strokeWidth={2.5} />
                </div>
              </div>
              <div className="h-10 w-px bg-gray-200 mx-2"></div>
              <div className="flex-1 flex flex-col justify-center px-2 py-1">
                <label htmlFor="username" className="text-[12px] font-medium text-gray-400">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="faculty_name"
                  className="w-full bg-transparent text-gray-900 font-semibold text-[15px] placeholder-gray-300 focus:outline-none"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              {username.length > 3 && (
                <div className="pr-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
              )}
            </div>

            {/* Custom Password Input */}
            <div className="relative flex items-center bg-white border border-gray-200 rounded-[20px] p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all shadow-sm">
              <div className="pl-4 pr-3 flex items-center justify-center">
                <div className="p-2 border border-gray-200 rounded-lg">
                  <Lock className="w-5 h-5 text-gray-800" strokeWidth={2.5} />
                </div>
              </div>
              <div className="h-10 w-px bg-gray-200 mx-2"></div>
              <div className="flex-1 flex flex-col justify-center px-2 py-1">
                <label htmlFor="password" className="text-[12px] font-medium text-gray-400">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-transparent text-gray-900 font-semibold text-[15px] placeholder-gray-300 focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center text-red-500 text-sm font-medium px-2">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 py-4 px-4 rounded-[20px] shadow-[0_8px_20px_rgb(37,99,235,0.2)] text-[16px] font-semibold text-white bg-[#0D6EFD] hover:bg-blue-600 focus:outline-none transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : 'Continue'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
