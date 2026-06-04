import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';
import { authService } from '../services/auth.service';
import { useAuthContext } from '../context/AuthContext';
import type { LoginFormValues, SignupFormValues } from '../schemas/auth.schema';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, logout } = useAuthContext();

  const handleLogin = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      const response = await authService.signIn(data);

      // Persiste token, refreshToken e user no contexto global (e localStorage)
      login(response.token, response.user, response.refreshToken);

      notification.success({ message: 'Sucesso', description: 'Login realizado com sucesso!' });
      navigate('/dashboard');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao realizar login. Tente novamente.';
      notification.error({ message: 'Erro', description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (data: SignupFormValues) => {
    try {
      setIsLoading(true);
      await authService.signUp(data);

      // Auto-login após cadastro
      const loginResponse = await authService.signIn({ email: data.email, password: data.password });

      login(loginResponse.token, loginResponse.user);

      notification.success({ message: 'Sucesso', description: 'Cadastro realizado com sucesso!' });
      navigate('/dashboard');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao realizar cadastro. Tente novamente.';
      notification.error({ message: 'Erro', description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    logout();
    navigate('/login');
  };

  return {
    handleLogin,
    handleSignUp,
    logout: handleLogout,
    isLoading,
  };
}
