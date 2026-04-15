import React from 'react';
import { AreaChartOutlined, PieChartOutlined, ArrowUpOutlined } from '@ant-design/icons';

function StatCard({ title, value, increase }: { title: string, value: string, increase: string }) {
  return (
    <div className="bg-surface rounded-xl p-6 shadow-soft flex flex-col justify-between border border-gray-50">
      <h3 className="text-[14px] text-gray-500 font-medium mb-1">{title}</h3>
      <div className="flex items-end justify-between mt-2">
        <span className="text-[28px] font-semibold text-gray-900 leading-none">{value}</span>
        <span className="text-[13px] font-medium text-success bg-success/10 px-2 py-0.5 rounded-full flex items-center gap-1">
          <ArrowUpOutlined className="text-[10px]" /> {increase}
        </span>
      </div>
    </div>
  );
}

export function Dashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Dashboard Geral</h1>
      
      {/* Top Level (Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Arrecadado" value="R$ 450k" increase="12%" />
        <StatCard title="Projetos Ativos" value="12" increase="2" />
        <StatCard title="Beneficiários" value="3.450" increase="15%" />
        <StatCard title="Horas Voluntárias" value="1.280h" increase="5%" />
      </div>

      {/* Middle Level (Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Chart */}
        <div className="lg:col-span-2 bg-surface rounded-xl shadow-soft p-6 border border-gray-50 flex flex-col min-h-[320px]">
          <h3 className="text-[16px] font-semibold text-gray-900 mb-6">Evolução Financeira</h3>
          <div className="flex-1 flex items-center justify-center bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
            <div className="text-center text-primary-300">
              <AreaChartOutlined className="text-5xl mb-2 opacity-50" />
              <p className="text-sm font-medium">Gráfico de Evolução (Em breve)</p>
            </div>
          </div>
        </div>
        
        {/* Right Chart */}
        <div className="lg:col-span-1 bg-surface rounded-xl shadow-soft p-6 border border-gray-50 flex flex-col min-h-[320px]">
          <h3 className="text-[16px] font-semibold text-gray-900 mb-6">Status dos Projetos</h3>
          <div className="flex-1 flex items-center justify-center bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
            <div className="text-center text-warning/70">
              <PieChartOutlined className="text-5xl mb-2 opacity-50" />
              <p className="text-sm font-medium">Gráfico de Pizza (Em breve)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Level (Table) */}
      <div className="bg-surface rounded-xl shadow-soft border border-gray-50 overflow-hidden mt-6">
        <div className="px-6 py-5 border-b border-gray-50">
          <h3 className="text-[16px] font-semibold text-gray-900">Tabela de Projetos Recentes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-[12px] uppercase tracking-wider">
                <th className="px-6 py-4 font-medium border-b border-gray-100">Nome do Projeto</th>
                <th className="px-6 py-4 font-medium border-b border-gray-100">Responsável</th>
                <th className="px-6 py-4 font-medium border-b border-gray-100">Status</th>
                <th className="px-6 py-4 font-medium border-b border-gray-100">Progresso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Mock Data 1 */}
              <tr className="hover:bg-gray-50/30 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Educação para o Futuro</td>
                <td className="px-6 py-4 text-sm text-gray-600">Carlos Silva</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-success/10 text-success uppercase tracking-wide">
                    Ativo
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 w-8">65%</span>
                    <div className="w-full max-w-[120px] bg-gray-100 rounded-full h-1.5 border border-gray-200">
                      <div className="bg-success h-full rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                </td>
              </tr>
              {/* Mock Data 2 */}
              <tr className="hover:bg-gray-50/30 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Saúde na Comunidade</td>
                <td className="px-6 py-4 text-sm text-gray-600">Ana Mendes</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-secondary-50 text-secondary-600 uppercase tracking-wide">
                    Planejando
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 w-8">10%</span>
                    <div className="w-full max-w-[120px] bg-gray-100 rounded-full h-1.5 border border-gray-200">
                      <div className="bg-secondary-500 h-full rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </td>
              </tr>
              {/* Mock Data 3 */}
              <tr className="hover:bg-gray-50/30 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Arrecadação de Inverno</td>
                <td className="px-6 py-4 text-sm text-gray-600">Mariana Costa</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-warning/10 text-warning uppercase tracking-wide">
                    Atrasado
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 w-8">45%</span>
                    <div className="w-full max-w-[120px] bg-gray-100 rounded-full h-1.5 border border-gray-200">
                      <div className="bg-warning h-full rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
