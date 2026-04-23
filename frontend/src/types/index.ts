// Entidade de Projeto
export interface Project {
  id: string;
  name: string;
  description?: string;
  manager: string;
  status: 'active' | 'completed' | 'blocked' | 'draft';
  startDate: string;
  endDate?: string;
  budget: number;
  tags: string[];
}

// Entidade Financeira (Captação e Despesas)
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: 'donation' | 'grant' | 'operational' | 'project_expense';
  value: number;
  date: string;
  description: string;
  projectId?: string; // Relacionamento com Projeto
  status: 'pending' | 'confirmed' | 'cancelled';
}

// Entidade CRM
export interface Stakeholder {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type: 'donor' | 'partner' | 'volunteer' | 'beneficiary';
  projectsLinked: string[]; // IDs dos projetos
  totalContributed?: number;
}