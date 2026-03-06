import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Upload, message, Input, Alert, Descriptions, Spin } from 'antd';
import { SafetyCertificateOutlined, UploadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { importarCertificado } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL || 'https://notafacil-api.adapterbot.cloud/api/v1';

function getToken(): string | null {
  try {
    const stored = localStorage.getItem('notafacil_user');
    if (stored) return JSON.parse(stored).token;
  } catch {}
  return null;
}

interface CertInfo {
  exists: boolean;
  name: string;
  createdOn?: string;
  expiresOn?: string;
}

const formatDate = (iso: string | undefined) => {
  if (!iso) return '—';
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const yy = d.getFullYear();
  return `${hh}:${mm} ${dd}/${mo}/${yy}`;
};

const ImportarCertificado: React.FC<{ readOnly?: boolean; onCertChange?: () => void }> = ({ readOnly = false, onCertChange }) => {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [certInfo, setCertInfo] = useState<CertInfo | null>(null);
  const [form] = Form.useForm();
  const { user } = useAuth();

  const certName = user?.cnpj ? `CNPJ${user.cnpj}` : '';

  const checkCert = async () => {
    if (!certName) return;
    setChecking(true);
    try {
      const token = getToken();
      const resp = await fetch(`${API_BASE.replace(/\/api\/v1$/, '')}/certificates/check/${certName}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      setCertInfo(data);
    } catch {
      setCertInfo(null);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => { checkCert(); }, [certName]);

  const onFinish = async (values: any) => {
    if (!file) {
      message.error('Selecione um certificado');
      return;
    }
    setLoading(true);
    try {
      const resp = await importarCertificado(file, certName, values.password);
      message.success(resp);
      form.resetFields();
      setFile(null);
      await checkCert();
      onCertChange?.();
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="🔐 Importar Certificado Digital" style={{ marginBottom: 16 }}>
      {checking ? (
        <Spin tip="Verificando certificado..." />
      ) : certInfo?.exists ? (
        <>
          <Alert
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            message="Certificado digital importado"
            style={{ marginBottom: 16 }}
          />
          <Descriptions bordered size="small" column={1} style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Nome">{certInfo.name}</Descriptions.Item>
            <Descriptions.Item label="Importado em">{formatDate(certInfo.createdOn)}</Descriptions.Item>
            <Descriptions.Item label="Expira em">{formatDate(certInfo.expiresOn)}</Descriptions.Item>
          </Descriptions>
        </>
      ) : (
        <Alert
          type="warning"
          showIcon
          message="Nenhum certificado encontrado para esta empresa"
          style={{ marginBottom: 16 }}
        />
      )}

      {!readOnly && <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Certificado (.p12 / .pfx)" required>
          <Upload
            accept=".p12,.pfx"
            maxCount={1}
            beforeUpload={(f) => { setFile(f); return false; }}
            onRemove={() => setFile(null)}
          >
            <Button icon={<UploadOutlined />}>Selecionar Certificado</Button>
          </Upload>
        </Form.Item>
        <Form.Item label="Nome do certificado">
          <Input value={certName} disabled style={{ width: 300 }} />
        </Form.Item>
        <Form.Item name="password" label="Senha do certificado" rules={[{ required: true }]}>
          <Input.Password style={{ width: 300 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} icon={<SafetyCertificateOutlined />} size="large">
            {certInfo?.exists ? 'Atualizar Certificado' : 'Importar Certificado'}
          </Button>
        </Form.Item>
      </Form>}
    </Card>
  );
};

export default ImportarCertificado;
