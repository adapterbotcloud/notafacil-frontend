import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, InputNumber, Select, Switch, message, Space, Popconfirm, Tag, Row, Col, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, BankOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { listarUsuarios, criarUsuario, atualizarUsuario, deletarUsuario, UsuarioDTO } from '../services/usuarioApi';
import { listarEmpresas, criarEmpresa, atualizarEmpresa, EmpresaDTO } from '../services/empresaApi';

const formatCnpj = (cnpj: string) =>
  cnpj?.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5') || cnpj;

const UsuarioManager: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UsuarioDTO[]>([]);
  const [empresas, setEmpresas] = useState<EmpresaDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [empresaModalOpen, setEmpresaModalOpen] = useState(false);
  const [editando, setEditando] = useState<UsuarioDTO | null>(null);
  const [editandoEmpresa, setEditandoEmpresa] = useState<EmpresaDTO | null>(null);
  const [form] = Form.useForm();
  const [empresaForm] = Form.useForm();
  const { user, isGestor, isAdmin } = useAuth();

  const empresasFiltradas = isGestor ? empresas.filter(e => e.cnpj === user?.cnpj) : empresas;

  const carregar = async () => {
    setLoading(true);
    try {
      let [u, e] = await Promise.all([listarUsuarios(), listarEmpresas()]);
      setUsuarios(u);
      setEmpresas(e);
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const abrirModal = (usuario?: UsuarioDTO) => {
    if (usuario) {
      setEditando(usuario);
      form.setFieldsValue({ ...usuario, password: '' });
    } else {
      setEditando(null);
      form.resetFields();
      if (isGestor) form.setFieldsValue({ cnpj: user?.cnpj });
    }
    setModalOpen(true);
  };

  const salvar = async () => {
    try {
      const values = await form.validateFields();
      if (editando?.id) {
        const payload: any = { nome: values.nome, cnpj: values.cnpj, role: values.role };
        if (values.password) payload.password = values.password;
        await atualizarUsuario(editando.id, payload);
        message.success('Usuário atualizado!');
      } else {
        await criarUsuario(values);
        message.success('Usuário criado!');
      }
      setModalOpen(false);
      carregar();
    } catch (err: any) {
      if (err.message) message.error(err.message);
    }
  };

  const remover = async (id: number) => {
    try {
      await deletarUsuario(id);
      message.success('Usuário removido!');
      carregar();
    } catch (err: any) {
      message.error(err.message);
    }
  };

  // Empresa modal
  const abrirEmpresaModal = (empresa?: EmpresaDTO) => {
    if (empresa) {
      setEditandoEmpresa(empresa);
      empresaForm.setFieldsValue(empresa);
    } else {
      setEditandoEmpresa(null);
      empresaForm.resetFields();
      empresaForm.setFieldsValue({
        codigoMunicipio: '2304400',
        regimeEspecialTributacao: 1,
        optanteSimplesNacional: 1,
        incentivadorCultural: 2,
        aliquota: 0.05,
        itemListaServico: '8.02',
        codigoTributacaoMunicipio: '859960401',
        substitutoTributario: false,
      });
    }
    setEmpresaModalOpen(true);
  };

  const salvarEmpresa = async () => {
    try {
      const values = await empresaForm.validateFields();
      const cnpjLimpo = values.cnpj.replace(/\D/g, '');
      const cepLimpo = values.cep?.replace(/\D/g, '') || '';
      const telLimpo = values.telefone?.replace(/\D/g, '') || '';
      const payload = { ...values, cnpj: cnpjLimpo, cep: cepLimpo, telefone: telLimpo };

      if (editandoEmpresa?.id) {
        await atualizarEmpresa(editandoEmpresa.id, payload);
        message.success('Empresa atualizada!');
      } else {
        await criarEmpresa(payload);
        message.success('Empresa cadastrada!');
      }
      setEmpresaModalOpen(false);
      carregar();
    } catch (err: any) {
      if (err.message) message.error(err.message);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Usuário', dataIndex: 'username', key: 'username', width: 150 },
    { title: 'Nome', dataIndex: 'nome', key: 'nome', width: 200 },
    {
      title: 'Empresa',
      dataIndex: 'cnpj',
      key: 'cnpj',
      width: 200,
      render: (cnpj: string) => {
        const emp = empresas.find(e => e.cnpj === cnpj);
        return emp?.razaoSocial ? `${emp.razaoSocial}` : formatCnpj(cnpj);
      },
    },
    {
      title: 'Perfil',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: string) => (
        <Tag color={role === 'ADMIN' ? 'red' : role === 'GESTOR' ? 'orange' : 'blue'}>{role}</Tag>
      ),
    },
    {
      title: 'Ações',
      key: 'acoes',
      width: 120,
      render: (_: any, record: UsuarioDTO) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => abrirModal(record)} />
          <Popconfirm title="Remover este usuário?" onConfirm={() => remover(record.id!)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={<span><UserOutlined /> Gestão de Usuários</span>}
      extra={
        <Space>
          {isAdmin && (
            <Button icon={<BankOutlined />} onClick={() => abrirEmpresaModal()}>
              Nova Empresa
            </Button>
          )}
          <Button type="primary" icon={<PlusOutlined />} onClick={() => abrirModal()}>
            Novo Usuário
          </Button>
        </Space>
      }
      style={{ marginBottom: 16 }}
    >
      {/* Empresas cadastradas */}
      {(isAdmin || isGestor) && empresas.length > 0 && (
        <>
          <Divider orientationMargin={0}><BankOutlined /> Empresas Cadastradas</Divider>
          <Table
            dataSource={empresasFiltradas}
            rowKey="id"
            size="small"
            pagination={false}
            style={{ marginBottom: 24 }}
            columns={[
              { title: 'CNPJ', dataIndex: 'cnpj', key: 'cnpj', width: 170, render: formatCnpj },
              { title: 'Razão Social', dataIndex: 'razaoSocial', key: 'razaoSocial', width: 250 },
              { title: 'IM', dataIndex: 'inscricaoMunicipal', key: 'im', width: 100 },
              { title: 'Município', dataIndex: 'codigoMunicipio', key: 'mun', width: 100 },
              { title: 'Alíquota', dataIndex: 'aliquota', key: 'aliq', width: 100, render: (v: number) => v ? `${(v * 100).toFixed(2)}%` : '' },
              {
                title: 'Ações', key: 'acoes', width: 80,
                render: (_: any, record: EmpresaDTO) => isAdmin ? (
                  <Button icon={<EditOutlined />} size="small" onClick={() => abrirEmpresaModal(record)} />
                ) : null,
              },
            ]}
          />
        </>
      )}

      <Divider orientationMargin={0}><UserOutlined /> Usuários</Divider>
      <Table
        columns={columns}
        dataSource={usuarios}
        rowKey="id"
        loading={loading}
        size="small"
        pagination={{ pageSize: 10 }}
      />

      {/* Modal Usuário */}
      <Modal
        title={editando ? 'Editar Usuário' : 'Novo Usuário'}
        open={modalOpen}
        onOk={salvar}
        onCancel={() => setModalOpen(false)}
        okText="Salvar"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="Usuário" rules={[{ required: !editando, message: 'Obrigatório' }]}>
            <Input disabled={!!editando} placeholder="login do usuário" />
          </Form.Item>
          <Form.Item
            name="password"
            label={editando ? 'Nova Senha (deixe vazio para manter)' : 'Senha'}
            rules={editando ? [] : [{ required: true, message: 'Obrigatório' }]}
          >
            <Input.Password placeholder="********" />
          </Form.Item>
          <Form.Item name="nome" label="Nome Completo" rules={[{ required: true, message: 'Obrigatório' }]}>
            <Input placeholder="Nome do usuário" />
          </Form.Item>
          <Form.Item name="cnpj" label="Empresa" rules={[{ required: true, message: 'Selecione uma empresa' }]}>
            <Select
              placeholder="Selecione a empresa"
              disabled={isGestor}
              showSearch
              optionFilterProp="children"
            >
              {empresasFiltradas.map(e => (
                <Select.Option key={e.cnpj} value={e.cnpj}>
                  {e.razaoSocial ? `${e.razaoSocial} (${formatCnpj(e.cnpj)})` : formatCnpj(e.cnpj)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="role" label="Perfil" rules={[{ required: true }]} initialValue="USER">
            <Select>
              <Select.Option value="USER">USER</Select.Option>
              <Select.Option value="GESTOR">GESTOR</Select.Option>
              {!isGestor && <Select.Option value="ADMIN">ADMIN</Select.Option>}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Empresa */}
      <Modal
        title={editandoEmpresa ? 'Editar Empresa' : 'Nova Empresa'}
        open={empresaModalOpen}
        onOk={salvarEmpresa}
        onCancel={() => setEmpresaModalOpen(false)}
        okText="Salvar"
        cancelText="Cancelar"
        width={700}
      >
        <Form form={empresaForm} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="cnpj" label="CNPJ" rules={[{ required: true, message: 'Obrigatório' }]}>
                <Input placeholder="00.000.000/0000-00" disabled={!!editandoEmpresa} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="razaoSocial" label="Razão Social">
                <Input placeholder="Nome da empresa" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="inscricaoMunicipal" label="Inscrição Municipal" rules={[{ required: true, message: 'Obrigatório' }]}>
                <Input placeholder="IM" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="codigoMunicipio" label="Código Município (IBGE)" rules={[{ required: true }]}>
                <Input placeholder="2304400" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="codigoTributacaoMunicipio" label="Código Tributação" rules={[{ required: true }]}>
                <Input placeholder="859960401" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientationMargin={0} plain>Endereço</Divider>
          <Row gutter={16}>
            <Col xs={24} sm={14}>
              <Form.Item name="endereco" label="Endereço">
                <Input placeholder="Rua / Avenida" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={4}>
              <Form.Item name="numero" label="Número">
                <Input placeholder="Nº" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item name="complemento" label="Complemento">
                <Input placeholder="Sala, Bloco" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="bairro" label="Bairro">
                <Input placeholder="Bairro" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="cep" label="CEP">
                <Input placeholder="00.000-000" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="telefone" label="Telefone">
                <Input placeholder="(00) 0000-0000" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientationMargin={0} plain>Tributação</Divider>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="aliquota" label="Alíquota ISS" rules={[{ required: true }]}>
                <InputNumber step={0.01} min={0} max={1} style={{ width: '100%' }} placeholder="0.05" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="itemListaServico" label="Item Lista Serviço" rules={[{ required: true }]}>
                <Input placeholder="8.02" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="substitutoTributario" label="Substituto Tributário" valuePropName="checked">
                <Switch checkedChildren="Sim" unCheckedChildren="Não" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="regimeEspecialTributacao" label="Regime Especial" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value={1}>1 - Microempresa Municipal</Select.Option>
                  <Select.Option value={2}>2 - Estimativa</Select.Option>
                  <Select.Option value={3}>3 - Sociedade de Profissionais</Select.Option>
                  <Select.Option value={4}>4 - Cooperativa</Select.Option>
                  <Select.Option value={5}>5 - MEI</Select.Option>
                  <Select.Option value={6}>6 - ME/EPP Simples Nacional</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="optanteSimplesNacional" label="Optante Simples" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value={1}>1 - Sim</Select.Option>
                  <Select.Option value={2}>2 - Não</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="incentivadorCultural" label="Incentivador Cultural" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value={1}>1 - Sim</Select.Option>
                  <Select.Option value={2}>2 - Não</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Card>
  );
};

export default UsuarioManager;
