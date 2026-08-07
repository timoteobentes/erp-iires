import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, notification, Spin } from 'antd';
import logoSigetes from '../../../assets/logo-sigetes.png';
import { invitesService, type InvitePreview } from '../../Settings/services/invites.service';
import { useAuthContext } from '../../Auth/context/AuthContext';

export function AcceptInviteForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();
  const { login } = useAuthContext();

  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setPreviewError('Link de convite inválido.');
      setLoadingPreview(false);
      return;
    }
    invitesService.preview(token)
      .then(setPreview)
      .catch((error) => setPreviewError(error.response?.data?.error || 'Convite inválido ou expirado.'))
      .finally(() => setLoadingPreview(false));
  }, [token]);

  const onSubmit = async (values: { name?: string; password?: string }) => {
    try {
      setIsSubmitting(true);
      const result = await invitesService.accept({ token, ...values });
      login(result.token, result.user, result.refreshToken);
      notification.success({ message: 'Bem-vindo(a)!', description: 'Convite aceito com sucesso.' });
      navigate('/dashboard');
    } catch (error: any) {
      notification.error({ message: 'Erro', description: error.response?.data?.error || 'Erro ao aceitar convite.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] mx-auto p-8 lg:p-0">
      <img src={logoSigetes} alt="SIGETES" className="w-full max-w-[220px] h-auto" />

      <div className="my-8">
        <h1 className="text-[26px] font-semibold text-gray-900 mb-1.5 leading-tight tracking-tight">Aceitar convite</h1>
      </div>

      {loadingPreview && <Spin />}

      {!loadingPreview && previewError && (
        <p className="text-[14px] text-red-600">{previewError}</p>
      )}

      {!loadingPreview && preview && (
        <>
          <p className="text-[14px] text-gray-600 mb-6">
            Você foi convidado(a) para fazer parte de <strong>{preview.organizationName}</strong>, com o papel de{' '}
            <strong>{preview.roleName}</strong>. E-mail: {preview.email}
          </p>

          <Form layout="vertical" onFinish={onSubmit} className="space-y-5">
            {preview.requiresNewAccount && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-medium text-gray-700">Seu nome</label>
                  <Form.Item name="name" rules={[{ required: true, message: 'Informe seu nome.' }]} className="mb-0">
                    <Input placeholder="Nome completo" className="w-full px-4 py-2.5 text-sm border-gray-200 rounded-lg focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all" />
                  </Form.Item>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-medium text-gray-700">Crie uma senha</label>
                  <Form.Item name="password" rules={[{ required: true, min: 6, message: 'Mínimo de 6 caracteres.' }]} className="mb-0">
                    <Input.Password placeholder="Sua senha" className="w-full px-4 py-2.5 text-sm border-gray-200 rounded-lg focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all" />
                  </Form.Item>
                </div>
              </>
            )}

            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              className="w-full bg-primary-500 hover:!bg-primary-600 active:!bg-primary-700 text-white text-[15px] font-medium h-auto py-2.5 rounded-lg transition-colors mt-4 border-none shadow-none"
            >
              {preview.requiresNewAccount ? 'Criar conta e entrar' : 'Aceitar convite e entrar'}
            </Button>
          </Form>
        </>
      )}
    </div>
  );
}
