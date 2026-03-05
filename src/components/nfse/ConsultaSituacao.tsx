import React, { useState } from 'react';
import { Card, Button, Input, Form, message, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { consultarSituacaoLoteRps } from '../../services/api';
import ResultViewer from './ResultViewer';

const ConsultaSituacao: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const onFinish = async (values: { protocolo: string }) => {
    setLoading(true);
    setResult(null);
    try {
      const resp = await consultarSituacaoLoteRps(values.protocolo);
      setResult(resp);
      message.success('Consulta realizada!');
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="🔍 Consultar Situação do Lote RPS" style={{ marginBottom: 16 }}>
      <Form layout="inline" onFinish={onFinish}>
        <Form.Item name="protocolo" rules={[{ required: true, message: 'Informe o protocolo' }]}>
          <Input placeholder="Número do protocolo" style={{ width: 300 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} icon={<SearchOutlined />}>
            Consultar Situação
          </Button>
        </Form.Item>
      </Form>
      <ResultViewer data={result} />
    </Card>
  );
};

export default ConsultaSituacao;
