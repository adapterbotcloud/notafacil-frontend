import React, { useState } from 'react';
import { Card, Button, Input, Form, Upload, message } from 'antd';
import { SafetyCertificateOutlined, UploadOutlined } from '@ant-design/icons';
import { importarCertificado } from '../../services/api';

const ImportarCertificado: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    if (!file) {
      message.error('Selecione um certificado');
      return;
    }
    setLoading(true);
    try {
      const resp = await importarCertificado(file, values.name, values.password);
      message.success(resp);
      form.resetFields();
      setFile(null);
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="🔐 Importar Certificado Digital" style={{ marginBottom: 16 }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
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
        <Form.Item name="name" label="Nome do certificado" rules={[{ required: true }]}>
          <Input placeholder="meu-certificado" style={{ width: 300 }} />
        </Form.Item>
        <Form.Item name="password" label="Senha do certificado" rules={[{ required: true }]}>
          <Input.Password style={{ width: 300 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} icon={<SafetyCertificateOutlined />} size="large">
            Importar Certificado
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ImportarCertificado;
