import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Select, Space, Statistic, Row, Col, Button, message } from 'antd';
import { FileTextOutlined, DollarOutlined, FilePdfOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

const statusLabel = (s: number) => (statusMap[s] || { label: `${s}` }).label;

const mesesNome = [
  '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const formatCurrency = (value: number) =>
  value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00';

const formatCpf = (cpf: string) => {
  if (!cpf || cpf.length !== 11) return cpf;
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

const RpsListagem: React.FC<{ refreshKey?: number }> = ({ refreshKey }) => {
  const [rpsList, setRpsList] = useState<RpsItem[]>([]);
  const [resumo, setResumo] = useState<AnoMesResumo[]>([]);
  const [loading, setLoading] = useState(false);
  const [ano, setAno] = useState<number | null>(null);
  const [mes, setMes] = useState<number | null>(null);

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
  }, [refreshKey]);

  useEffect(() => {
    if (!ano) return;
    setLoading(true);
    let url = `${API_BASE}/rps?ano=${ano}`;
    if (mes) url += `&mes=${mes}`;

    fetch(url, { headers: headers() })
      .then(r => r.json())
      .then(data => setRpsList(data))
      .catch(() => message.error('Erro ao carregar RPS'))
      .finally(() => setLoading(false));
  }, [ano, mes, refreshKey]);

  const anos = Array.from(new Set(resumo.map(r => r.ano))).sort((a, b) => b - a);
  const mesesDisponiveis = resumo.filter(r => r.ano === ano).map(r => r.mes).sort((a, b) => b - a);

  const totalValor = rpsList.reduce((sum, r) => sum + (r.valorServicos || 0), 0);
  const totalPendentes = rpsList.filter(r => r.status === 0).length;
  const totalEnviados = rpsList.filter(r => r.status === 2).length;
  const totalFalhas = rpsList.filter(r => r.status === 3).length;

  const gerarPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    const competencia = mes ? `${mesesNome[mes]}/${ano}` : `${ano}`;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatorio de RPS Emitidos', 14, 15);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Competencia: ${competencia}`, 14, 22);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28);

    doc.setFontSize(10);
    doc.text(`Total: ${rpsList.length} RPS  |  Valor: ${formatCurrency(totalValor)}  |  Pendentes: ${totalPendentes}  |  Enviados: ${totalEnviados}  |  Falhas: ${totalFalhas}`, 14, 35);

    const tableData = rpsList.map(r => [
      r.idCobranca || '',
      r.tomadorRazaoSocial || '',
      formatCpf(r.tomadorCpf),
      r.discriminacao || '',
      formatCurrency(r.valorServicos),
      statusLabel(r.status),
      r.protocolo || '',
      r.mesCobranca && r.anoCobranca ? `${String(r.mesCobranca).padStart(2, '0')}/${r.anoCobranca}` : '',
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['ID Cobr.', 'Tomador', 'CPF', 'Discriminacao', 'Valor', 'Status', 'Protocolo', 'Compet.']],
      body: tableData,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [22, 119, 255], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 18 },
        1: { cellWidth: 50 },
        2: { cellWidth: 30 },
        3: { cellWidth: 80 },
        4: { cellWidth: 25, halign: 'right' as const },
        5: { cellWidth: 20, halign: 'center' as const },
        6: { cellWidth: 30 },
        7: { cellWidth: 20, halign: 'center' as const },
      },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 5) {
          const val = data.cell.raw;
          if (val === 'Enviado') data.cell.styles.textColor = [34, 139, 34];
          else if (val === 'Falha') data.cell.styles.textColor = [220, 20, 60];
          else if (val === 'Pendente') data.cell.styles.textColor = [184, 134, 11];
        }
      },
    });

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`NotaFacil - Pagina ${i} de ${pageCount}`, 14, doc.internal.pageSize.height - 8);
    }

    const filename = mes
      ? `RPS_${ano}_${String(mes).padStart(2, '0')}.pdf`
      : `RPS_${ano}.pdf`;
    doc.save(filename);
    message.success(`PDF gerado: ${filename}`);
  };

  const columns: ColumnsType<RpsItem> = [
    {
      title: 'ID Cobranca',
      dataIndex: 'idCobranca',
      key: 'idCobranca',
      width: 110,
      render: v => v || '',
    },
    {
      title: 'Numero',
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
      title: 'Discriminacao',
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
      render: v => v || '',
    },
    {
      title: 'Competencia',
      key: 'competencia',
      width: 120,
      render: (_: any, r: RpsItem) => r.mesCobranca && r.anoCobranca ? `${String(r.mesCobranca).padStart(2, '0')}/${r.anoCobranca}` : '',
    },
    {
      title: 'Criado em',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (v: string) => v ? new Date(v).toLocaleString('pt-BR') : '',
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
          placeholder="Mes"
          value={mes}
          onChange={setMes}
          style={{ width: 160 }}
          allowClear
        >
          {mesesDisponiveis.map(m => {
            const qtd = resumo.find(r => r.ano === ano && r.mes === m)?.quantidade || 0;
            return (
              <Select.Option key={m} value={m}>{mesesNome[m]} ({qtd})</Select.Option>
            );
          })}
        </Select>
        <Button
          type="primary"
          icon={<FilePdfOutlined />}
          onClick={gerarPdf}
          disabled={rpsList.length === 0}
          danger
        >
          Gerar PDF
        </Button>
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
