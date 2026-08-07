import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, Button } from 'antd';
import { loginSchema, type LoginFormValues } from '../../Auth/schemas/auth.schema';
import { useAuth } from '../../Auth/hooks/useAuth';
import logoSigetes from '../../../assets/logo-sigetes.png';

export function AuthForm() {
  const { handleLogin, isLoading } = useAuth();

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const onSubmit = (data: LoginFormValues) => {
    handleLogin(data);
  };

  return (
    <div className="w-full max-w-[400px] mx-auto p-8 lg:p-0">
      <img src={logoSigetes} alt="SIGETES" className="w-full max-w-[220px] h-auto" />
      
      <div className="my-8">
        <h1 className="text-[26px] font-semibold text-gray-900 mb-1.5 leading-tight tracking-tight">Entrar</h1>
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
                  placeholder="Seu e-mail"
                  className="w-full px-4 py-2.5 text-sm border-gray-200 rounded-lg focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
                />
              </Form.Item>
            )}
          />
        </div>
        
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-[13px] font-medium text-gray-700">Senha</label>
            <a href="/forgot-password" className="text-[13px] text-primary-600 hover:text-primary-700 hover:underline font-medium">Esqueceu a senha?</a>
          </div>
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
                  placeholder="Sua senha"
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
           Entrar
        </Button>
      </Form>

      <p className="mt-8 text-[14px] text-gray-600">
        Acesso restrito à equipe da sua instituição. Solicite seu usuário ao administrador da conta.
      </p>
    </div>
  );
}
