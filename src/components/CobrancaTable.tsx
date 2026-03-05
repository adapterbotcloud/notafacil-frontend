import React, { useState } from 'react';
import { Table, Tag, Input, Select, Space, Card } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Cobranca } from '../types/Cobranca';

interface CobrancaTableProps {
  cobrancas: Cobranca[];
}

const situacaoColor: Record<string, string> = {
  'Pago via PIX': 'green',
  'Pago via boleto': 'green',
  'Pago na escola': 'green',
  'Pago atrasado': 'orange',
  'Pendente': 'gold',
  'Atrasado': 'red',
  'Gerou PIX': 'blue',
  'Gerou boleto': 'blue',
  'Não enviado': 'default',
};

const formatCurrency = (value: number) =>
  value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00';

const CobrancaTable: React.FC<CobrancaTableProps> = ({ cobrancas }) => {
  const [search, setSearch] = useState('');
  const [filtroSituacao, setFiltroSituacao] = useState<string | null>(null);

  const situacoes = Array.from(new Set(cobrancas.map((c) => c.situacao).filter(Boolean)));

  const filtered = cobrancas.filter((c) => {
    const matchSearch =
      !search ||
      c.nomeAluno.toLowerCase().includes(search.toLowerCase()) ||
      c.responsavel.toLowerCase().includes(search.toLowerCase()) ||
      c.cpfResponsavel.includes(search);
    const matchSituacao = !filtroSituacao || c.situacao === filtroSituacao;
    return matchSearch && matchSituacao;
  });

  const columns: ColumnsType<Cobranca> = [
    {
      title: 'Aluno',
      dataIndex: 'nomeAluno',
      key: 'nomeAluno',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Responsável',
      dataIndex: 'responsavel',
      key: 'responsavel',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'CPF',
      dataIndex: 'cpfResponsavel',
      key: 'cpfResponsavel',
      width: 140,
    },
    {
      title: 'Turma',
      dataIndex: 'turma',
      key: 'turma',
      width: 120,
    },
    {
      title: 'Valor Cobrado',
      dataIndex: 'valorCobrado',
      key: 'valorCobrado',
      width: 130,
      align: 'right',
      render: (v: number) => formatCurrency(v),
      sorter: (a, b) => a.valorCobrado - b.valorCobrado,
    },
    {
      title: 'Valor Pago',
      dataIndex: 'valorPago',
      key: 'valorPago',
      width: 130,
      align: 'right',
      render: (v: number) => formatCurrency(v),
      sorter: (a, b) => a.valorPago - b.valorPago,
    },
    {
      title: 'Vencimento',
      dataIndex: 'vencimento',
      key: 'vencimento',
      width: 110,
    },
    {
      title: 'Situação',
      dataIndex: 'situacao',
      key: 'situacao',
      width: 140,
      render: (s: string) => (
        <Tag color={situacaoColor[s] || 'default'}>{s}</Tag>
      ),
    },
    {
      title: 'Método',
      dataIndex: 'metodoPagamento',
      key: 'metodoPagamento',
      width: 120,
    },
  ];

  return (
    <Card title={`Cobranças (${filtered.length} de ${cobrancas.length})`}>
      <Space style={{ marginBottom: 16, width: '100%', flexWrap: 'wrap' }}>
        <Input
          placeholder="Buscar por aluno, responsável ou CPF..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 320 }}
          allowClear
        />
        <Select
          placeholder="Filtrar por situação"
          value={filtroSituacao}
          onChange={setFiltroSituacao}
          allowClear
          style={{ width: 200 }}
        >
          {situacoes.map((s) => (
            <Select.Option key={s} value={s}>
              <Tag color={situacaoColor[s] || 'default'}>{s}</Tag>
            </Select.Option>
          ))}
        </Select>
      </Space>
      <Table
        columns={columns}
        dataSource={filtered}
        rowKey={(r) => `${r.idCobranca}-${r.idAluno}`}
        scroll={{ x: 1200 }}
        pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `Total: ${t}` }}
        size="small"
      />
    </Card>
  );
};

export default CobrancaTable;
