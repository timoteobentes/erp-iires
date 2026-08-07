import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, Button, notification } from 'antd';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../Auth/services/auth.service';
import logoSigetes from '../../../assets/logo-sigetes.png';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const { control, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    }
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      notification.error({ message: 'Erro', description: 'Token de recuperação não encontrado na URL.' });
      return;
    }

    try {
      setIsLoading(true);
      await authService.resetPassword({ token, newPassword: data.password });
      notification.success({ 
        message: 'Sucesso', 
        description: 'Senha redefinida com sucesso! Você já pode fazer login.' 
      });
      navigate('/login');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao redefinir a senha. Tente novamente.';
      notification.error({ message: 'Erro', description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] mx-auto p-8 lg:p-0">
      <img src={logoSigetes} alt="SIGETES" className="w-full max-w-[220px] h-auto" />
      
      <div className="my-8">
        <h1 className="text-[26px] font-semibold text-gray-900 mb-1.5 leading-tight tracking-tight">Redefinir senha</h1>
        <p className="text-[14px] text-gray-600">Por favor, insira sua nova senha abaixo.</p>
      </div>

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-[13px] font-medium text-gray-700">Nova Senha</label>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Form.Item
                validateStatus={errors.password ? 'error' : ''}
                help={errors.password?.message}
                className="mb-0"
              >
                <Input.Password 
                  {...field}
                  placeholder="Nova senha"
                  className="w-full px-4 py-2.5 text-sm border-gray-200 rounded-lg focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all" 
                />
              </Form.Item>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[13px] font-medium text-gray-700">Repetir Nova Senha</label>
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <Form.Item
                validateStatus={errors.confirmPassword ? 'error' : ''}
                help={errors.confirmPassword?.message}
                className="mb-0"
              >
                <Input.Password 
                  {...field}
                  placeholder="Repita sua nova senha"
                  className="w-full px-4 py-2.5 text-sm border-gray-200 rounded-lg focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all" 
                />
              </Form.Item>
            )}
          />
        </div>
        
        <Button 
          type="primary"
          htmlType="submit"
          loading={isLoading}
          className="w-full bg-primary-500 hover:!bg-primary-600 active:!bg-primary-700 text-white text-[15px] font-medium h-auto py-2.5 rounded-lg transition-colors mt-4 border-none shadow-none"
        >
           Salvar nova senha
        </Button>
      </Form>
    </div>
  );
}
