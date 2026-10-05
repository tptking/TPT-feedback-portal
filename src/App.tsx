import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import StudentDashboard from './pages/StudentDashboard';
import FeedbackForm from './pages/FeedbackForm';
import FacultyDashboard from './pages/FacultyDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        
        {/* Redirect old login routes to unified landing */}
        <Route path="/student/login" element={<Navigate to="/" replace />} />
        <Route path="/faculty/login" element={<Navigate to="/" replace />} />

        {/* Student Routes */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/feedback/:subjectId" element={<FeedbackForm />} />

        {/* Faculty Routes */}
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
