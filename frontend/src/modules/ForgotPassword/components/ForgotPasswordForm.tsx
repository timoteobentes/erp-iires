import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, Button, notification } from 'antd';
import { useState } from 'react';
import { authService } from '../../Auth/services/auth.service';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('Formato de e-mail inválido'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    }
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      setIsLoading(true);
      await authService.forgotPassword(data.email);
      notification.success({ 
        message: 'E-mail enviado', 
        description: 'Verifique sua caixa de entrada para redefinir a senha.' 
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao solicitar redefinição. Tente novamente.';
      notification.error({ message: 'Erro', description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] mx-auto p-8 lg:p-0">
      <img src="/src/assets/logo-original.png" alt="IIRes" className="w-full h-auto opacity-100" />
      
      <div className="my-8">
        <h1 className="text-[26px] font-semibold text-gray-900 mb-1.5 leading-tight tracking-tight">Esqueceu a senha?</h1>
        <p className="text-[14px] text-gray-600">Não se preocupe, nós enviaremos instruções para redefinir sua senha.</p>
      </div>

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)} className="space-y-5">        
        <div className="space-y-1.5">
          <label className="block text-[13px] font-medium text-gray-700">E-mail</label>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Form.Item
                validateStatus={errors.email ? 'error' : ''}
                help={errors.email?.message}
                className="mb-0"
              >
                <Input 
                  {...field}
                  type="email"
                  placeholder="Seu e-mail cadastrado"
                  className="w-full px-4 py-2.5 text-sm border-gray-200 rounded-lg focus:ring-4 focus:ring-[#635BFF]/10 focus:border-[#635BFF] transition-all" 
                />
              </Form.Item>
            )}
          />
        </div>
        
        <Button 
          type="primary"
          htmlType="submit"
          loading={isLoading}
          className="w-full bg-[#026B11] hover:!bg-[#026B11]/80 active:!bg-[#026B11]/60 text-white text-[15px] font-medium h-auto py-2.5 rounded-lg transition-colors mt-4 border-none shadow-none"
        >
           Enviar link de recuperação
        </Button>
      </Form>

      <div className="mt-8 text-center">
        <a href="/login" className="text-[14px] text-gray-600 hover:text-[#524ae3] hover:underline font-medium flex items-center justify-center gap-2">
          ← Voltar para o login
        </a>
      </div>
    </div>
  );
}
