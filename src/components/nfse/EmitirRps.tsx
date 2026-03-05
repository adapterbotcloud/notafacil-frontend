import React, { useState } from 'react';
import { Card, Button, message, Form, Input, InputNumber, Space, Collapse, Divider } from 'antd';
import { ThunderboltOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { emitirRps } from '../../services/api';
import ResultViewer from './ResultViewer';

const EmitirRps: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    setLoading(true);
    setResult(null);
    try {
      const listaRps = (values.listaRps || []).map((rps: any) => ({
        identificacaoRps: { numero: rps.numero, serie: rps.serie || 'A', tipo: rps.tipo || 1 },
        dataEmissao: rps.dataEmissao,
        naturezaOperacao: 1,
        regimeEspecialTributacao: 1,
        optanteSimplesNacional: 2,
        incentivadorCultural: 2,
        status: 1,
        servico: {
          valores: {
            valorServicos: rps.valorServicos,
            baseCalculo: rps.valorServicos,
            aliquota: rps.aliquota || 0.05,
            valorIss: (rps.valorServicos * (rps.aliquota || 0.05)),
            valorLiquidoNfse: rps.valorServicos,
            issRetido: 2,
          },
          itemListaServico: rps.itemListaServico || '1.02',
          discriminacao: rps.discriminacao || 'Serviço prestado',
          codigoMunicipio: '2304400',
        },
        prestador: { cnpj: rps.prestadorCnpj, inscricaoMunicipal: rps.prestadorInscricao },
        tomador: {
          identificacaoTomador: { cnpj: rps.tomadorCnpj },
          razaoSocial: rps.tomadorRazaoSocial,
          contato: { email: rps.tomadorEmail || '' },
        },
      }));
      await emitirRps(listaRps);
      setResult({ status: 'Aceito', message: 'RPS enviados para processamento em lotes' });
      message.success('RPS enviados com sucesso!');
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="⚡ Emitir RPS (Assíncrono)" style={{ marginBottom: 16 }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.List name="listaRps" initialValue={[{}]}>
          {(fields, { add, remove }) => (
            <>
              <Collapse accordion>
                {fields.map(({ key, name }) => (
                  <Collapse.Panel
                    key={key}
                    header={`RPS #${name + 1}`}
                    extra={fields.length > 1 ? <MinusCircleOutlined onClick={() => remove(name)} /> : null}
                  >
                    <Space style={{ display: 'flex', flexWrap: 'wrap' }} size="middle">
                      <Form.Item name={[name, 'numero']} label="Número" rules={[{ required: true }]}>
                        <Input style={{ width: 120 }} />
                      </Form.Item>
                      <Form.Item name={[name, 'serie']} label="Série" initialValue="A">
                        <Input style={{ width: 80 }} />
                      </Form.Item>
                      <Form.Item name={[name, 'dataEmissao']} label="Data Emissão" rules={[{ required: true }]}>
                        <Input placeholder="2025-01-01T08:00:00" style={{ width: 200 }} />
                      </Form.Item>
                      <Form.Item name={[name, 'valorServicos']} label="Valor" rules={[{ required: true }]}>
                        <InputNumber prefix="R$" precision={2} style={{ width: 150 }} />
                      </Form.Item>
                      <Form.Item name={[name, 'discriminacao']} label="Discriminação">
                        <Input style={{ width: 300 }} />
                      </Form.Item>
                    </Space>
                    <Divider plain>Prestador / Tomador</Divider>
                    <Space style={{ display: 'flex', flexWrap: 'wrap' }} size="middle">
                      <Form.Item name={[name, 'prestadorCnpj']} label="CNPJ Prestador" rules={[{ required: true }]}>
                        <Input style={{ width: 200 }} />
                      </Form.Item>
                      <Form.Item name={[name, 'prestadorInscricao']} label="Inscrição Municipal">
                        <Input style={{ width: 150 }} />
                      </Form.Item>
                      <Form.Item name={[name, 'tomadorCnpj']} label="CNPJ Tomador" rules={[{ required: true }]}>
                        <Input style={{ width: 200 }} />
                      </Form.Item>
                      <Form.Item name={[name, 'tomadorRazaoSocial']} label="Razão Social Tomador" rules={[{ required: true }]}>
                        <Input style={{ width: 250 }} />
                      </Form.Item>
                      <Form.Item name={[name, 'tomadorEmail']} label="Email Tomador">
                        <Input style={{ width: 200 }} />
                      </Form.Item>
                    </Space>
                  </Collapse.Panel>
                ))}
              </Collapse>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} style={{ marginTop: 16 }}>
                Adicionar RPS
              </Button>
            </>
          )}
        </Form.List>
        <Form.Item style={{ marginTop: 24 }}>
          <Button type="primary" htmlType="submit" loading={loading} icon={<ThunderboltOutlined />} size="large">
            Emitir RPS
          </Button>
        </Form.Item>
      </Form>
      <ResultViewer data={result} />
    </Card>
  );
};

export default EmitirRps;
