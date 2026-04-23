import { useState } from 'react';
import { type FormInstance, message } from 'antd';
import { getAddressByCep } from '../services/viacep';

export function useCep(form: FormInstance) {
  const [loadingCep, setLoadingCep] = useState(false);

  const handleCEPBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cepValue = e.target.value;
    const cleanCep = cepValue.replace(/\D/g, '');

    if (cleanCep.length === 8) {
      setLoadingCep(true);
      try {
        const data = await getAddressByCep(cleanCep);

        // Preenche os dados no formulário do Ant Design
        form.setFieldsValue({
          address: data.logradouro,
          neighborhood: data.bairro,
          city: data.localidade,
          state: data.uf,
        });

        // UX: Foca automaticamente no campo número para o usuário não usar o mouse
        setTimeout(() => {
          const numberInput = document.getElementById('team_form_number');
          numberInput?.focus();
        }, 100);

      } catch (error: any) {
        message.error(error.message || 'Erro ao processar o CEP.');
      } finally {
        setLoadingCep(false);
      }
    }
  };

  return { loadingCep, handleCEPBlur };
}