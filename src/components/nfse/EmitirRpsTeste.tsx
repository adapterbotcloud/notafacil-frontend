import React, { useState, useMemo, useEffect } from 'react';
import { Card, Button, message, Table, Tag, Alert, Space, Input, Select, Tooltip } from 'antd';
import { ExperimentOutlined, SearchOutlined, WarningOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { emitirRpsTeste, verificarRpsExistentes, RpsTesteItem } from '../../services/api';
import { Cobranca, ResumoFinanceiro } from '../../types/Cobranca';
import ResultViewer from './ResultViewer';

interface EmitirRpsTesteProps {
  cobrancas: Cobranca[];
  resumo: ResumoFinanceiro | null;
}

type CobrancaStatus = 'valida' | 'invalida' | 'ja_enviada';

interface CobrancaComStatus extends Cobranca {
  _status: CobrancaStatus;
  _motivo: string;
}

function extrairMesAno(dataEnvio: string): string {
  if (!dataEnvio) return '';
  const parts = dataEnvio.split('/');
  if (parts.length === 3) return `${parts[1]}/${parts[2]}`;
  return dataEnvio;
}

function buildDiscriminacao(titulo: string, dataEnvio: string): string {
  const mesAno = extrairMesAno(dataEnvio);
  return mesAno ? `${titulo} - ${mesAno}` : titulo;
}

const formatCurrency = (value: number) =>
  value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00';

const EmitirRpsTeste: React.FC<EmitirRpsTesteProps> = ({ cobrancas, resumo }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [search, setSearch] = useState('');
  const [filtroSituacao, setFiltroSituacao] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<CobrancaStatus | null>(null);
  const [jaEnviados, setJaEnviados] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Verificar quais cobranças já tem RPS ao carregar
  useEffect(() => {
    if (cobrancas.length === 0) return;
    const ids = cobrancas.map(c => c.idCobranca).filter(id => id > 0);
    if (ids.length === 0) return;

    verificarRpsExistentes(ids).then(existentes => {
      setJaEnviados(new Set(existentes));
    }).catch(() => {});
  }, [cobrancas]);

  // Classificar cada cobrança
  const cobrancasComStatus: CobrancaComStatus[] = useMemo(() => {
    return cobrancas.map(c => {
      let status: CobrancaStatus = 'valida';
      let motivo = '';

      if (jaEnviados.has(c.idCobranca)) {
        status = 'ja_enviada';
        motivo = 'RPS já gerado para esta cobrança';
      } else if (c.valorCobrado <= 0) {
        status = 'invalida';
        motivo = 'Valor cobrado = R$ 0,00';
      } else if (!c.cpfResponsavel || c.cpfResponsavel.replace(/[.\-\/]/g, '').length < 11) {
        status = 'invalida';
        motivo = 'CPF do responsável ausente ou inválido';
      } else if (!c.responsavel || c.responsavel.trim().length === 0) {
        status = 'invalida';
        motivo = 'Nome do responsável ausente';
      }

      return { ...c, _status: status, _motivo: motivo };
    });
  }, [cobrancas, jaEnviados]);

  const situacoes = useMemo(
    () => Array.from(new Set(cobrancas.map(c => c.situacao).filter(Boolean))),
    [cobrancas]
  );

  const filtered = useMemo(() => {
    return cobrancasComStatus.filter(c => {
      const matchSearch = !search ||
        c.nomeAluno.toLowerCase().includes(search.toLowerCase()) ||
        c.responsavel.toLowerCase().includes(search.toLowerCase()) ||
        c.cpfResponsavel.includes(search);
      const matchSituacao = !filtroSituacao || c.situacao === filtroSituacao;
      const matchStatus = !filtroStatus || c._status === filtroStatus;
      return matchSearch && matchSituacao && matchStatus;
    });
  }, [cobrancasComStatus, search, filtroSituacao, filtroStatus]);

  const statusTag = (status: CobrancaStatus, motivo: string) => {
    switch (status) {
      case 'ja_enviada':
        return <Tooltip title={motivo}><Tag icon={<CheckCircleOutlined />} color="green">RPS Gerado</Tag></Tooltip>;
      case 'invalida':
        return <Tooltip title={motivo}><Tag icon={<WarningOutlined />} color="orange">{motivo}</Tag></Tooltip>;
      default:
        return <Tag color="blue">Pronto</Tag>;
    }
  };

  const columns: ColumnsType<CobrancaComStatus> = [
    {
      title: 'ID Cobrança',
      dataIndex: 'idCobranca',
      key: 'idCobranca',
      width: 110,
    },
    {
      title: 'Aluno',
      dataIndex: 'nomeAluno',
      key: 'nomeAluno',
      width: 180,
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
      title: 'Discriminação',
      key: 'discriminacao',
      width: 280,
      ellipsis: true,
      render: (_: any, record: CobrancaComStatus) => buildDiscriminacao(record.titulo, record.vencimento),
    },
    {
      title: 'Valor Cobrado',
      dataIndex: 'valorCobrado',
      key: 'valorCobrado',
      width: 130,
      align: 'right',
      render: (v: number) => <strong>{formatCurrency(v)}</strong>,
      sorter: (a, b) => a.valorCobrado - b.valorCobrado,
    },
    {
      title: 'Situação',
      dataIndex: 'situacao',
      key: 'situacao',
      width: 130,
      render: (s: string) => {
        const color = s?.includes('Pago') ? 'green' : s === 'Pendente' ? 'gold' : s === 'Atrasado' ? 'red' : 'default';
        return <Tag color={color}>{s}</Tag>;
      },
    },
    {
      title: 'Status RPS',
      key: 'statusRps',
      width: 160,
      render: (_: any, record: CobrancaComStatus) => statusTag(record._status, record._motivo),
    },
  ];

  // Contadores
  const totalValidas = cobrancasComStatus.filter(c => c._status === 'valida').length;
  const totalInvalidas = cobrancasComStatus.filter(c => c._status === 'invalida').length;
  const totalJaEnviadas = cobrancasComStatus.filter(c => c._status === 'ja_enviada').length;

  const handleEmitir = async () => {
    if (selectedKeys.length === 0) {
      message.warning('Selecione pelo menos uma cobrança');
      return;
    }

    const cnpj = resumo?.cnpj?.replace(/[.\-\/]/g, '') || '';
    if (!cnpj) {
      message.error('CNPJ da empresa não encontrado no arquivo');
      return;
    }

    // Filtrar só as válidas
    const selectedCobrancas = cobrancasComStatus.filter(c =>
      selectedKeys.includes(`${c.idCobranca}-${c.idAluno}`) && c._status === 'valida'
    );

    if (selectedCobrancas.length === 0) {
      message.warning('Nenhuma cobrança válida selecionada. Verifique o status.');
      return;
    }

    const ignoradas = selectedKeys.length - selectedCobrancas.length;
    if (ignoradas > 0) {
      message.info(`${ignoradas} cobrança(s) ignorada(s) (inválidas ou já enviadas)`);
    }

    const listaRps: any[] = selectedCobrancas.map((c, index) => {
      const partsEnvio = (c.vencimento || '').split('/');
      const mesCobranca = partsEnvio.length === 3 ? parseInt(partsEnvio[1], 10) : null;
      const anoCobranca = partsEnvio.length === 3 ? parseInt(partsEnvio[2], 10) : null;
      return {
        id: index + 1,
        idCobranca: c.idCobranca,
        mesCobranca,
        anoCobranca,
        servico: {
          valorServicos: c.valorCobrado,
          discriminacao: buildDiscriminacao(c.titulo, c.vencimento),
        },
        tomador: {
          cpf: c.cpfResponsavel.replace(/[.\-\/]/g, ''),
          razaoSocial: c.responsavel,
        },
      };
    });

    setLoading(true);
    setResult(null);
    try {
      const resp = await emitirRpsTeste(cnpj, listaRps);
      setResult(resp);
      message.success(`${listaRps.length} RPS emitidos com sucesso!`);

      // Atualizar lista de já enviados
      const novosEnviados = new Set(jaEnviados);
      selectedCobrancas.forEach(c => novosEnviados.add(c.idCobranca));
      setJaEnviados(novosEnviados);
      setSelectedKeys([]);
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalSelecionado = cobrancasComStatus
    .filter(c => selectedKeys.includes(`${c.idCobranca}-${c.idAluno}`) && c._status === 'valida')
    .reduce((sum, c) => sum + (c.valorCobrado || 0), 0);

  const selecionadasValidas = cobrancasComStatus
    .filter(c => selectedKeys.includes(`${c.idCobranca}-${c.idAluno}`) && c._status === 'valida').length;

  return (
    <Card title="🧪 Emitir RPS Teste (Síncrono)" style={{ marginBottom: 16 }}>
      <Alert
        message={`CNPJ da Empresa: ${resumo?.cnpj || '—'} | ${resumo?.razaoSocial || ''}`}
        description={
          <Space>
            <Tag color="blue">{totalValidas} prontas</Tag>
            <Tag color="orange">{totalInvalidas} inválidas</Tag>
            <Tag color="green">{totalJaEnviadas} já enviadas</Tag>
          </Space>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Space style={{ marginBottom: 16, width: '100%', flexWrap: 'wrap' }}>
        <Input
          placeholder="Buscar por aluno, responsável ou CPF..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
        <Select
          placeholder="Filtrar por situação"
          value={filtroSituacao}
          onChange={setFiltroSituacao}
          allowClear
          style={{ width: 180 }}
        >
          {situacoes.map(s => (
            <Select.Option key={s} value={s}>{s}</Select.Option>
          ))}
        </Select>
        <Select
          placeholder="Status RPS"
          value={filtroStatus}
          onChange={setFiltroStatus}
          allowClear
          style={{ width: 160 }}
        >
          <Select.Option value="valida"><Tag color="blue">Pronto</Tag></Select.Option>
          <Select.Option value="invalida"><Tag color="orange">Inválida</Tag></Select.Option>
          <Select.Option value="ja_enviada"><Tag color="green">Já Enviada</Tag></Select.Option>
        </Select>
        <Button
          onClick={() => {
            const start = (currentPage - 1) * pageSize;
            const end = start + pageSize;
            const pageKeys = filtered.slice(start, end)
              .filter(r => r._status === 'valida')
              .map(r => `${r.idCobranca}-${r.idAluno}`);
            setSelectedKeys(prev => Array.from(new Set([...prev, ...pageKeys])));
          }}
        >
          Selecionar Página
        </Button>
        <Button
          type="primary"
          onClick={() => {
            const allKeys = filtered.filter(r => r._status === 'valida').map(r => `${r.idCobranca}-${r.idAluno}`);
            setSelectedKeys(allKeys);
          }}
        >
          Selecionar Todos Válidos ({filtered.filter(r => r._status === 'valida').length})
        </Button>
        <Button onClick={() => setSelectedKeys([])} disabled={selectedKeys.length === 0}>
          Limpar Seleção
        </Button>
      </Space>

      <Table
        rowSelection={{
          selectedRowKeys: selectedKeys,
          onChange: setSelectedKeys,
          getCheckboxProps: (record: CobrancaComStatus) => ({
            disabled: record._status !== 'valida',
          }),
        }}
        columns={columns}
        dataSource={filtered}
        rowKey={r => `${r.idCobranca}-${r.idAluno}`}
        scroll={{ x: 1400 }}
        pagination={{
          pageSize,
          current: currentPage,
          showSizeChanger: true,
          showTotal: t => `Total: ${t}`,
          onChange: (page, size) => { setCurrentPage(page); setPageSize(size); },
        }}
        size="small"
        rowClassName={(record: CobrancaComStatus) => {
          if (record._status === 'ja_enviada') return 'row-ja-enviada';
          if (record._status === 'invalida') return 'row-invalida';
          return '';
        }}
      />

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>
          <strong>{selecionadasValidas}</strong> cobrança(s) válida(s) selecionada(s) — Total: <strong>{formatCurrency(totalSelecionado)}</strong>
        </span>
        <Button
          type="primary"
          onClick={handleEmitir}
          loading={loading}
          icon={<ExperimentOutlined />}
          size="large"
          disabled={selecionadasValidas === 0}
          danger
        >
          Emitir {selecionadasValidas} RPS
        </Button>
      </div>

      <ResultViewer data={result} />
    </Card>
  );
};

export default EmitirRpsTeste;
