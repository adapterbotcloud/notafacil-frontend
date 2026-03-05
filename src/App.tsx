import React, { useState } from 'react';
import { ConfigProvider, Layout, Typography, Tabs, Button, Space, theme } from 'antd';
import {
  UploadOutlined,
  SendOutlined,
  SearchOutlined,
  FileSearchOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
  SafetyCertificateOutlined,
  LogoutOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import ptBR from 'antd/locale/pt_BR';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import FileUpload from './components/FileUpload';
import ResumoCard from './components/ResumoCard';
import CobrancaTable from './components/CobrancaTable';
import RecepcionarLote from './components/nfse/RecepcionarLote';
import ConsultaSituacao from './components/nfse/ConsultaSituacao';
import ConsultaLote from './components/nfse/ConsultaLote';
import EmitirRps from './components/nfse/EmitirRps';
import EmitirRpsTeste from './components/nfse/EmitirRpsTeste';
import ImportarCertificado from './components/nfse/ImportarCertificado';
import UsuarioManager from './components/UsuarioManager';
import RpsListagem from './components/RpsListagem';
import { Cobranca, ResumoFinanceiro } from './types/Cobranca';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const AppContent: React.FC = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);

  if (!isAuthenticated) return <LoginPage />;

  const hasUpload = cobrancas.length > 0;

  const handleDataParsed = (r: ResumoFinanceiro, c: Cobranca[]) => {
    setResumo(r);
    setCobrancas(c);
  };

  const tabItems = [
    {
      key: 'upload',
      label: 'Upload Planilha',
      icon: <UploadOutlined />,
      children: (
        <>
          <FileUpload onDataParsed={handleDataParsed} />
          {resumo && <ResumoCard resumo={resumo} />}
          {cobrancas.length > 0 && <CobrancaTable cobrancas={cobrancas} />}
        </>
      ),
    },
    {
      key: 'recepcionar',
      label: 'Recepcionar Lote',
      icon: <SendOutlined />,
      children: <RecepcionarLote />,
    },
    {
      key: 'situacao',
      label: 'Consultar Situação',
      icon: <SearchOutlined />,
      children: <ConsultaSituacao />,
    },
    {
      key: 'consulta-lote',
      label: 'Consultar Lote',
      icon: <FileSearchOutlined />,
      children: <ConsultaLote />,
    },
    {
      key: 'emitir',
      label: 'Emitir RPS',
      icon: <ThunderboltOutlined />,
      children: <EmitirRps />,
    },
    {
      key: 'emitir-teste',
      label: hasUpload ? 'Emitir RPS (Teste)' : 'Emitir RPS (Teste) ⚠️',
      icon: <ExperimentOutlined />,
      disabled: !hasUpload,
      children: <EmitirRpsTeste cobrancas={cobrancas} resumo={resumo} />,
    },
    {
      key: 'rps-listagem',
      label: 'RPS Emitidos',
      icon: <FileTextOutlined />,
      children: <RpsListagem />,
    },
    {
      key: 'certificado',
      label: 'Certificado',
      icon: <SafetyCertificateOutlined />,
      children: <ImportarCertificado />,
    },
    ...(isAdmin ? [{
      key: 'usuarios',
      label: 'Usuários',
      icon: <TeamOutlined />,
      children: <UsuarioManager />,
    }] : []),
  ];

  const cnpjFormatado = user?.cnpj?.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header style={{
        background: '#fff',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <Title level={3} style={{ margin: 0, color: '#1677ff', cursor: 'pointer' }} onClick={() => window.location.reload()}>
          📝 NotaFácil
        </Title>
        <Space>
          <UserOutlined />
          <Text strong>{user?.nome}</Text>
          <Text type="secondary">({user?.role})</Text>
          <Text type="secondary">| CNPJ: {cnpjFormatado}</Text>
          <Button icon={<LogoutOutlined />} onClick={logout} type="text" danger>
            Sair
          </Button>
        </Space>
      </Header>
      <Content style={{ padding: '24px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        <Tabs
          defaultActiveKey="upload"
          items={tabItems}
          size="large"
          type="card"
        />
      </Content>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ConfigProvider
      locale={ptBR}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: { colorPrimary: '#1677ff', borderRadius: 8 },
      }}
    >
      <AppContent />
    </ConfigProvider>
  );
};

export default App;
