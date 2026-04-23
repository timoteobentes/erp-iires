import { useState } from 'react';
import { type FormInstance, message } from 'antd';
import consultarCNPJ from 'consultar-cnpj';

export function useCnpj(form: FormInstance) {
  const [loadingCnpj, setLoadingCnpj] = useState(false);

  const handleCNPJBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cnpjValue = e.target.value.replace(/\D/g, '');

    // O CNPJ puro tem exatos 14 números
    if (cnpjValue.length === 14) {
      setLoadingCnpj(true);
      try {
        const empresa = await consultarCNPJ(cnpjValue);

        if (!empresa || !empresa.razao_social) {
          message.error('CNPJ não encontrado ou inválido.');
          return;
        }

        // Mapeia os dados retornados para os campos do nosso formulário
        form.setFieldsValue({
          name: empresa.razao_social,
          // Pega o primeiro e-mail e telefone se houver
          email: empresa.estabelecimento?.email || '',
          phone: empresa.estabelecimento?.ddd1 && empresa.estabelecimento?.telefone1 
            ? `(${empresa.estabelecimento.ddd1}) ${empresa.estabelecimento.telefone1}`
            : '',
          cep: empresa.estabelecimento?.cep,
          address: String(empresa.estabelecimento?.logradouro || ''),
          number: String(empresa.estabelecimento?.numero || ''),
          neighborhood: String(empresa.estabelecimento?.bairro || ''),
          city: String(empresa.estabelecimento?.cidade?.nome || ''),
          state: String(empresa.estabelecimento?.estado?.sigla || '')
        });

        message.success('Dados da empresa importados com sucesso!');

      } catch (error) {
        console.error(error);
        message.error('Erro ao consultar o CNPJ. Verifique sua conexão.');
      } finally {
        setLoadingCnpj(false);
      }
    }
  };

  return { loadingCnpj, handleCNPJBlur };
}