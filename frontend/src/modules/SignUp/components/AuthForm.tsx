import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, Button } from 'antd';
import { signupSchema, type SignupFormValues } from '../../Auth/schemas/auth.schema';
import { useAuth } from '../../Auth/hooks/useAuth';
import logoOriginal from '../../../assets/logo-original.png';

export function AuthForm() {
  const { handleSignUp, isLoading } = useAuth();

  const { control, handleSubmit, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    }
  });

  const onSubmit = (data: SignupFormValues) => {
    handleSignUp(data);
  };

  return (
    <div className="w-full max-w-[400px] mx-auto p-8 lg:p-0">
      <img src={logoOriginal} alt="IIRes" className="w-full h-auto opacity-100" />
      
      <div className="my-8">
        <h1 className="text-[26px] font-semibold text-gray-900 mb-1.5 leading-tight tracking-tight">Cadastre-se</h1>
      </div>

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-[13px] font-medium text-gray-700">Nome</label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Form.Item
                validateStatus={errors.name ? 'error' : ''}
                help={errors.name?.message}
                className="mb-0"
              >
                <Input 
                  {...field}
                  type="text"
                  placeholder="Seu nome completo"
                  className="w-full px-4 py-2.5 text-sm border-gray-200 rounded-lg focus:ring-4 focus:ring-[#635BFF]/10 focus:border-[#635BFF] transition-all" 
                />
              </Form.Item>
            )}
          />
        </div>
        
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
                  className="w-full px-4 py-2.5 text-sm border-gray-200 rounded-lg focus:ring-4 focus:ring-[#635BFF]/10 focus:border-[#635BFF] transition-all" 
                />
              </Form.Item>
            )}
          />
        </div>
        
        <div className="space-y-1.5">
          <label className="block text-[13px] font-medium text-gray-700">Senha</label>
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
                  placeholder="Crie uma senha forte"
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
           Cadastrar
        </Button>
      </Form>

      <p className="mt-8 text-[14px] text-gray-600">
        Já tem uma conta? <a href="/login" className="text-[#635BFF] hover:text-[#524ae3] hover:underline font-medium ml-1">Entrar</a>
      </p>
    </div>
  );
}
