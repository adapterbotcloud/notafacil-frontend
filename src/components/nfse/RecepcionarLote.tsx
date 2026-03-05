import React, { useState } from 'react';
import { Card, Button, message, Input, InputNumber, Form, Space, Collapse, Divider } from 'antd';
import { SendOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { recepcionarLoteRps } from '../../services/api';
import ResultViewer from './ResultViewer';

const RecepcionarLote: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        loteRps: {
          id: values.id,
          numeroLote: values.numeroLote,
          cnpj: values.cnpj,
          inscricaoMunicipal: values.inscricaoMunicipal,
          quantidadeRps: values.listaRps?.length || 1,
          listaRps: (values.listaRps || []).map((rps: any) => ({
            infRps: {
              identificacaoRps: {
                numero: rps.numero,
                serie: rps.serie || 'A',
                tipo: rps.tipo || 1,
              },
              dataEmissao: rps.dataEmissao,
              naturezaOperacao: rps.naturezaOperacao || 1,
              regimeEspecialTributacao: rps.regimeEspecialTributacao || 1,
              optanteSimplesNacional: rps.optanteSimplesNacional || 2,
              incentivadorCultural: 2,
              status: 1,
              servico: {
                valores: {
                  valorServicos: rps.valorServicos,
                  valorDeducoes: 0,
                  valorPis: 0,
                  valorCofins: 0,
                  valorInss: 0,
                  valorIr: 0,
                  valorCsll: 0,
                  issRetido: 2,
                  valorIss: rps.valorIss || 0,
                  valorIssRetido: 0,
                  outrasRetencoes: 0,
                  baseCalculo: rps.valorServicos,
                  aliquota: rps.aliquota || 0.05,
                  valorLiquidoNfse: rps.valorServicos,
                  descontoIncondicionado: 0,
                  descontoCondicionado: 0,
                },
                itemListaServico: rps.itemListaServico || '1.02',
                codigoTributacaoMunicipio: rps.codigoTributacaoMunicipio || '010101010',
                discriminacao: rps.discriminacao || 'Serviço prestado',
                codigoMunicipio: '2304400',
              },
              prestador: {
                cnpj: values.cnpj,
                inscricaoMunicipal: values.inscricaoMunicipal,
              },
              tomador: {
                identificacaoTomador: {
                  cnpj: rps.tomadorCnpj,
                  inscricaoMunicipal: rps.tomadorInscricao || '',
                },
                razaoSocial: rps.tomadorRazaoSocial,
                endereco: {
                  endereco: rps.tomadorEndereco || '',
                  numero: rps.tomadorNumero || '',
                  bairro: rps.tomadorBairro || '',
                  codigoMunicipio: '2304400',
                  uf: 'CE',
                  cep: rps.tomadorCep || '',
                },
                contato: {
                  telefone: rps.tomadorTelefone || '',
                  email: rps.tomadorEmail || '',
                },
              },
            },
          })),
        },
      };
      const resp = await recepcionarLoteRps(payload);
      setResult(resp);
      message.success('Lote enviado com sucesso!');
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="📤 Recepcionar Lote RPS" style={{ marginBottom: 16 }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Space style={{ display: 'flex', flexWrap: 'wrap' }} size="middle">
          <Form.Item name="id" label="ID do Lote" rules={[{ required: true }]}>
            <InputNumber style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="numeroLote" label="Nº do Lote" rules={[{ required: true }]}>
            <Input style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="cnpj" label="CNPJ Prestador" rules={[{ required: true }]}>
            <Input style={{ width: 200 }} placeholder="00000000000000" />
          </Form.Item>
          <Form.Item name="inscricaoMunicipal" label="Inscrição Municipal" rules={[{ required: true }]}>
            <Input style={{ width: 150 }} />
          </Form.Item>
        </Space>

        <Divider>Lista de RPS</Divider>

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
                        <Input style={{ width: 200 }} placeholder="2025-01-01T08:00:00" />
                      </Form.Item>
                      <Form.Item name={[name, 'valorServicos']} label="Valor Serviços" rules={[{ required: true }]}>
                        <InputNumber style={{ width: 150 }} prefix="R$" precision={2} />
                      </Form.Item>
                      <Form.Item name={[name, 'aliquota']} label="Alíquota" initialValue={0.05}>
                        <InputNumber style={{ width: 120 }} step={0.01} />
                      </Form.Item>
                      <Form.Item name={[name, 'discriminacao']} label="Discriminação">
                        <Input style={{ width: 300 }} />
                      </Form.Item>
                    </Space>
                    <Divider plain>Tomador</Divider>
                    <Space style={{ display: 'flex', flexWrap: 'wrap' }} size="middle">
                      <Form.Item name={[name, 'tomadorCnpj']} label="CNPJ/CPF Tomador" rules={[{ required: true }]}>
                        <Input style={{ width: 200 }} />
                      </Form.Item>
                      <Form.Item name={[name, 'tomadorRazaoSocial']} label="Razão Social" rules={[{ required: true }]}>
                        <Input style={{ width: 250 }} />
                      </Form.Item>
                      <Form.Item name={[name, 'tomadorEmail']} label="Email">
                        <Input style={{ width: 200 }} />
                      </Form.Item>
                      <Form.Item name={[name, 'tomadorTelefone']} label="Telefone">
                        <Input style={{ width: 150 }} />
                      </Form.Item>
                      <Form.Item name={[name, 'tomadorEndereco']} label="Endereço">
                        <Input style={{ width: 250 }} />
                      </Form.Item>
                      <Form.Item name={[name, 'tomadorBairro']} label="Bairro">
                        <Input style={{ width: 150 }} />
                      </Form.Item>
                      <Form.Item name={[name, 'tomadorCep']} label="CEP">
                        <Input style={{ width: 120 }} />
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
          <Button type="primary" htmlType="submit" loading={loading} icon={<SendOutlined />} size="large">
            Enviar Lote
          </Button>
        </Form.Item>
      </Form>
      <ResultViewer data={result} />
    </Card>
  );
};

export default RecepcionarLote;
