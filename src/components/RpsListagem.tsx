import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Select, Space, Statistic, Row, Col, message } from 'antd';
import { FileTextOutlined, DollarOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const API_BASE = process.env.REACT_APP_API_URL || 'https://notafacil-api.adapterbot.cloud/api/v1';

function getToken(): string | null {
  try {
    const stored = localStorage.getItem('notafacil_user');
    if (stored) return JSON.parse(stored).token;
  } catch {}
  return null;
}

function headers() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

interface RpsItem {
  id: number;
  idCobranca: number | null;
  numero: string;
  serie: string;
  dataEmissao: string;
  valorServicos: number;
  tomadorCpf: string;
  tomadorRazaoSocial: string;
  discriminacao: string;
  status: number;
  protocolo: string | null;
  mensagemErro: string | null;
  mesCobranca: number | null;
  anoCobranca: number | null;
  createdAt: string;
}

interface AnoMesResumo {
  ano: number;
  mes: number;
  quantidade: number;
}

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: 'Pendente', color: 'gold' },
  1: { label: 'Enviando', color: 'blue' },
  2: { label: 'Enviado', color: 'green' },
  3: { label: 'Falha', color: 'red' },
};

const meses = [
  '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const formatCurrency = (value: number) =>
  value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00';

const formatCpf = (cpf: string) => {
  if (!cpf || cpf.length !== 11) return cpf;
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

const RpsListagem: React.FC = () => {
  const [rpsList, setRpsList] = useState<RpsItem[]>([]);
  const [resumo, setResumo] = useState<AnoMesResumo[]>([]);
  const [loading, setLoading] = useState(false);
  const [ano, setAno] = useState<number | null>(null);
  const [mes, setMes] = useState<number | null>(null);

  // Carregar resumo de anos/meses
  useEffect(() => {
    fetch(`${API_BASE}/rps/resumo`, { headers: headers() })
      .then(r => r.json())
      .then(data => {
        setResumo(data);
        if (data.length > 0) {
          setAno(data[0].ano);
          setMes(data[0].mes);
        }
      })
      .catch(() => {});
  }, []);

  // Carregar RPS quando mudar filtro
  useEffect(() => {
    if (!ano) return;
    setLoading(true);
    let url = `${API_BASE}/rps?ano=${ano}`;
    if (mes) url += `&mes=${mes}`;

    fetch(url, { headers: headers() })
      .then(r => r.json())
      .then(data => {
        setRpsList(data);
      })
      .catch(err => message.error('Erro ao carregar RPS'))
      .finally(() => setLoading(false));
  }, [ano, mes]);

  const anos = Array.from(new Set(resumo.map(r => r.ano))).sort((a, b) => b - a);
  const mesesDisponiveis = resumo.filter(r => r.ano === ano).map(r => r.mes).sort((a, b) => b - a);

  const totalValor = rpsList.reduce((sum, r) => sum + (r.valorServicos || 0), 0);
  const totalPendentes = rpsList.filter(r => r.status === 0).length;
  const totalEnviados = rpsList.filter(r => r.status === 2).length;
  const totalFalhas = rpsList.filter(r => r.status === 3).length;

  const columns: ColumnsType<RpsItem> = [
    {
      title: 'ID Cobrança',
      dataIndex: 'idCobranca',
      key: 'idCobranca',
      width: 110,
      render: v => v || '—',
    },
    {
      title: 'Número',
      dataIndex: 'numero',
      key: 'numero',
      width: 150,
    },
    {
      title: 'Tomador',
      dataIndex: 'tomadorRazaoSocial',
      key: 'tomadorRazaoSocial',
      width: 220,
      ellipsis: true,
    },
    {
      title: 'CPF',
      dataIndex: 'tomadorCpf',
      key: 'tomadorCpf',
      width: 140,
      render: (v: string) => formatCpf(v),
    },
    {
      title: 'Discriminação',
      dataIndex: 'discriminacao',
      key: 'discriminacao',
      width: 280,
      ellipsis: true,
    },
    {
      title: 'Valor',
      dataIndex: 'valorServicos',
      key: 'valorServicos',
      width: 130,
      align: 'right',
      render: (v: number) => <strong>{formatCurrency(v)}</strong>,
      sorter: (a, b) => a.valorServicos - b.valorServicos,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (s: number) => {
        const info = statusMap[s] || { label: `${s}`, color: 'default' };
        return <Tag color={info.color}>{info.label}</Tag>;
      },
    },
    {
      title: 'Protocolo',
      dataIndex: 'protocolo',
      key: 'protocolo',
      width: 140,
      render: v => v || '—',
    },
    {
      title: 'Competência',
      key: 'competencia',
      width: 120,
      render: (_: any, r: RpsItem) => r.mesCobranca && r.anoCobranca ? `${String(r.mesCobranca).padStart(2, '0')}/${r.anoCobranca}` : '—',
    },
    {
      title: 'Criado em',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (v: string) => v ? new Date(v).toLocaleString('pt-BR') : '—',
    },
  ];

  return (
    <Card title={<span><FileTextOutlined /> RPS Emitidos</span>} style={{ marginBottom: 16 }}>
      <Space style={{ marginBottom: 16, flexWrap: 'wrap' }}>
        <Select
          placeholder="Ano"
          value={ano}
          onChange={v => { setAno(v); setMes(null); }}
          style={{ width: 120 }}
          allowClear
        >
          {anos.map(a => (
            <Select.Option key={a} value={a}>{a}</Select.Option>
          ))}
        </Select>
        <Select
          placeholder="Mês"
          value={mes}
          onChange={setMes}
          style={{ width: 160 }}
          allowClear
        >
          {mesesDisponiveis.map(m => {
            const qtd = resumo.find(r => r.ano === ano && r.mes === m)?.quantidade || 0;
            return (
              <Select.Option key={m} value={m}>{meses[m]} ({qtd})</Select.Option>
            );
          })}
        </Select>
      </Space>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Statistic title="Total RPS" value={rpsList.length} prefix={<FileTextOutlined />} />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            title="Valor Total"
            value={totalValor}
            precision={2}
            prefix={<DollarOutlined />}
            formatter={v => formatCurrency(Number(v))}
          />
        </Col>
        <Col xs={12} sm={4}>
          <Statistic title="Pendentes" value={totalPendentes} valueStyle={{ color: '#faad14' }} />
        </Col>
        <Col xs={12} sm={4}>
          <Statistic title="Enviados" value={totalEnviados} valueStyle={{ color: '#52c41a' }} />
        </Col>
        <Col xs={12} sm={4}>
          <Statistic title="Falhas" value={totalFalhas} valueStyle={{ color: '#ff4d4f' }} />
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={rpsList}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1400 }}
        pagination={{ pageSize: 20, showSizeChanger: true, showTotal: t => `Total: ${t}` }}
        size="small"
      />
    </Card>
  );
};

export default RpsListagem;
