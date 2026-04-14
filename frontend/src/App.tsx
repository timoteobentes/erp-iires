import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginModule from './modules/Login';
import SignUpModule from './modules/SignUp';
import ForgotPasswordModule from './modules/ForgotPassword';
import ResetPasswordModule from './modules/ResetPassword';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginModule />} />
        <Route path="/signup" element={<SignUpModule />} />
        <Route path="/forgot-password" element={<ForgotPasswordModule />} />
        <Route path="/reset-password" element={<ResetPasswordModule />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
