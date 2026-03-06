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
  const { user, logout, isAuthenticated, isAdmin, isGestor } = useAuth();
  const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [rpsRefresh, setRpsRefresh] = useState(0);

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
      key: 'emitir-teste',
      label: hasUpload ? 'Emitir RPS' : 'Emitir RPS ⚠️',
      icon: <ExperimentOutlined />,
      disabled: !hasUpload,
      children: <EmitirRpsTeste cobrancas={cobrancas} resumo={resumo} />,
    },
    {
      key: 'rps-listagem',
      label: 'RPS Emitidos',
      icon: <FileTextOutlined />,
      children: <RpsListagem refreshKey={rpsRefresh} />,
    },
    {
      key: 'certificado',
      label: 'Certificado',
      icon: <SafetyCertificateOutlined />,
      children: <ImportarCertificado readOnly={!(isAdmin || isGestor)} />,
    },
    ...((isAdmin || isGestor) ? [{
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
        padding: '0 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        flexWrap: 'wrap',
        height: 'auto',
        minHeight: 64,
        gap: 4,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 8 }} onClick={() => window.location.reload()}>
          <img src="/logo.jpg" alt="NotaFácil" style={{ height: 40 }} />
        </div>
        <Space wrap size={4} style={{ fontSize: 12 }}>
          <UserOutlined />
          <Text strong style={{ fontSize: 13 }}>{user?.nome}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>({user?.role})</Text>
          <Text type="secondary" className="hide-mobile" style={{ fontSize: 12 }}>| CNPJ: {cnpjFormatado}</Text>
          <Button icon={<LogoutOutlined />} onClick={logout} type="text" danger size="small">
            Sair
          </Button>
        </Space>
      </Header>
      <Content style={{ padding: '8px 12px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        <Tabs
          defaultActiveKey="upload"
          items={tabItems}
          onChange={(key) => { if (key === 'rps-listagem') setRpsRefresh(prev => prev + 1); }}
          size="middle"
          type="card"
          tabBarStyle={{ overflowX: 'auto' }}
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
