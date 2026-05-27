import { api } from '../../../api/api';
import type { LoginFormValues, SignupFormValues } from '../schemas/auth.schema';

export const authService = {
  async signIn(data: LoginFormValues) {
    const response = await api.post('/auth/login', data);
    return response.data as { token: string; user: any; message: string };
  },

  async signUp(data: SignupFormValues) {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updateMe(data: { name?: string; phone?: string }) {
    const response = await api.patch('/auth/me', data);
    return response.data as { message: string; user: any };
  },

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    const response = await api.patch('/auth/change-password', data);
    return response.data as { message: string };
  },

  async forgotPassword(email: string) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(data: { token: string; newPassword: string }) {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },
};
