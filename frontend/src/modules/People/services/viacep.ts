export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export const getAddressByCep = async (cep: string): Promise<ViaCepResponse> => {
  const cleanCep = cep.replace(/\D/g, '');
  
  if (cleanCep.length !== 8) {
    throw new Error('Formato de CEP inválido.');
  }

  const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
  
  if (!response.ok) {
    throw new Error('Falha na comunicação com o servidor do ViaCEP.');
  }

  const data = await response.json();
  
  if (data.erro) {
    throw new Error('CEP não encontrado na base de dados.');
  }

  return data;
};