import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, Button, Select, Steps, message } from 'antd';
import consultarCNPJ from 'consultar-cnpj';
import { signupSchema, type SignupFormValues } from '../../Auth/schemas/auth.schema';
import { useAuth } from '../../Auth/hooks/useAuth';
import { normalizeCNPJ } from '../../../utils/masks';
import logoSigetes from '../../../assets/logo-sigetes.png';

const LEGAL_NATURES = [
  { value: 'ASSOCIACAO', label: 'Associação' },
  { value: 'FUNDACAO', label: 'Fundação' },
  { value: 'INSTITUTO', label: 'Instituto' },
  { value: 'OSCIP', label: 'OSCIP' },
  { value: 'ORGANIZACAO_SOCIAL', label: 'Organização Social' },
  { value: 'COOPERATIVA', label: 'Cooperativa' },
  { value: 'EMPRESA_LTDA', label: 'Empresa Ltda.' },
  { value: 'EMPRESA_SA', label: 'Empresa S.A.' },
  { value: 'MEI', label: 'MEI' },
  { value: 'OUTRO', label: 'Outro' },
];

const inputClass = 'w-full px-4 py-2.5 text-sm border-gray-200 rounded-lg focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all';

export function AuthForm() {
  const { handleSignUp, isLoading } = useAuth();
  const [step, setStep] = useState(0);
  const [loadingCnpj, setLoadingCnpj] = useState(false);

  const { control, handleSubmit, trigger, setValue, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '', email: '', password: '', organizationName: '', document: '', legalNature: 'OUTRO',
      zipCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '',
    },
  });

  const onSubmit = (data: SignupFormValues) => {
    handleSignUp(data);
  };

  const goToStep2 = async () => {
    const valid = await trigger(['name', 'email', 'password']);
    if (valid) setStep(1);
  };

  const handleCnpjBlur = async (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (digits.length !== 14) return;
    setLoadingCnpj(true);
    try {
      const empresa: any = await consultarCNPJ(digits);
      if (!empresa?.razao_social) {
        message.error('CNPJ não encontrado.');
        return;
      }
      setValue('organizationName', empresa.razao_social);
      setValue('zipCode', empresa.estabelecimento?.cep || '');
      setValue('street', String(empresa.estabelecimento?.logradouro || ''));
      setValue('number', String(empresa.estabelecimento?.numero || ''));
      setValue('neighborhood', String(empresa.estabelecimento?.bairro || ''));
      setValue('city', String(empresa.estabelecimento?.cidade?.nome || ''));
      setValue('state', String(empresa.estabelecimento?.estado?.sigla || ''));
      message.success('Dados da instituição importados pelo CNPJ!');
    } catch {
      message.error('Não foi possível consultar esse CNPJ. Preencha manualmente.');
    } finally {
      setLoadingCnpj(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto p-8 lg:p-0">
      <img src={logoSigetes} alt="SIGETES" className="w-full max-w-[220px] h-auto" />

      <div className="my-6">
        <h1 className="text-[26px] font-semibold text-gray-900 mb-3 leading-tight tracking-tight">Cadastre sua instituição</h1>
        <Steps
          size="small"
          current={step}
          items={[{ title: 'Sua conta' }, { title: 'Instituição' }]}
        />
      </div>

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)} className="space-y-5">
        {step === 0 && (
          <>
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-700">Nome</label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Form.Item validateStatus={errors.name ? 'error' : ''} help={errors.name?.message} className="mb-0">
                    <Input {...field} placeholder="Seu nome completo" className={inputClass} />
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
                  <Form.Item validateStatus={errors.email ? 'error' : ''} help={errors.email?.message} className="mb-0">
                    <Input {...field} type="email" placeholder="Seu e-mail" className={inputClass} />
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
                  <Form.Item validateStatus={errors.password ? 'error' : ''} help={errors.password?.message} className="mb-0">
                    <Input.Password {...field} placeholder="Crie uma senha forte" className={inputClass} />
                  </Form.Item>
                )}
              />
            </div>

            <Button
              type="primary"
              onClick={goToStep2}
              className="w-full bg-primary-500 hover:!bg-primary-600 active:!bg-primary-700 text-white text-[15px] font-medium h-auto py-2.5 rounded-lg transition-colors mt-4 border-none shadow-none"
            >
              Continuar
            </Button>
          </>
        )}

        {step === 1 && (
          <>
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-700">CNPJ (opcional)</label>
              <Controller
                name="document"
                control={control}
                render={({ field }) => (
                  <Form.Item className="mb-0">
                    <Input
                      {...field}
                      placeholder="00.000.000/0000-00"
                      className={inputClass}
                      onChange={(e) => field.onChange(normalizeCNPJ(e.target.value))}
                      onBlur={(e) => { field.onBlur(); handleCnpjBlur(e.target.value); }}
                      disabled={loadingCnpj}
                    />
                  </Form.Item>
                )}
              />
              <p className="text-xs text-gray-400">Se informado, preenchemos o nome e endereço automaticamente.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-700">Nome da instituição</label>
              <Controller
                name="organizationName"
                control={control}
                render={({ field }) => (
                  <Form.Item validateStatus={errors.organizationName ? 'error' : ''} help={errors.organizationName?.message} className="mb-0">
                    <Input {...field} placeholder="Nome da sua instituição" className={inputClass} />
                  </Form.Item>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-gray-700">Natureza jurídica</label>
              <Controller
                name="legalNature"
                control={control}
                render={({ field }) => (
                  <Form.Item className="mb-0">
                    <Select {...field} options={LEGAL_NATURES} className="w-full" size="large" />
                  </Form.Item>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1 space-y-1.5">
                <label className="block text-[13px] font-medium text-gray-700">CEP</label>
                <Controller name="zipCode" control={control} render={({ field }) => (
                  <Input {...field} className={inputClass} />
                )} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="block text-[13px] font-medium text-gray-700">Cidade/UF</label>
                <div className="flex gap-2">
                  <Controller name="city" control={control} render={({ field }) => (
                    <Input {...field} className={inputClass} placeholder="Cidade" />
                  )} />
                  <Controller name="state" control={control} render={({ field }) => (
                    <Input {...field} className={inputClass} placeholder="UF" maxLength={2} />
                  )} />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button onClick={() => setStep(0)} className="flex-1 h-auto py-2.5 rounded-lg">
                Voltar
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                className="flex-[2] bg-primary-500 hover:!bg-primary-600 active:!bg-primary-700 text-white text-[15px] font-medium h-auto py-2.5 rounded-lg transition-colors border-none shadow-none"
              >
                Criar minha conta
              </Button>
            </div>
          </>
        )}
      </Form>

      <p className="mt-8 text-[14px] text-gray-600">
        Já tem uma conta? <a href="/login" className="text-primary-600 hover:text-primary-700 hover:underline font-medium ml-1">Entrar</a>
      </p>
    </div>
  );
}
