import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, message, Space, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { listarUsuarios, criarUsuario, atualizarUsuario, deletarUsuario, UsuarioDTO } from '../services/usuarioApi';

const UsuarioManager: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UsuarioDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<UsuarioDTO | null>(null);
  const [form] = Form.useForm();
  const { user, isGestor } = useAuth();

  const carregar = async () => {
    setLoading(true);
    try {
      const data = await listarUsuarios();
      setUsuarios(data);
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

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Usuário', dataIndex: 'username', key: 'username', width: 150 },
    { title: 'Nome', dataIndex: 'nome', key: 'nome', width: 200 },
    {
      title: 'CNPJ',
      dataIndex: 'cnpj',
      key: 'cnpj',
      width: 170,
      render: (cnpj: string) => cnpj?.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5') || cnpj,
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
        <Button type="primary" icon={<PlusOutlined />} onClick={() => abrirModal()}>
          Novo Usuário
        </Button>
      }
      style={{ marginBottom: 16 }}
    >
      <Table
        columns={columns}
        dataSource={usuarios}
        rowKey="id"
        loading={loading}
        size="small"
        pagination={{ pageSize: 10 }}
      />

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
          <Form.Item name="cnpj" label="CNPJ da Empresa" rules={[{ required: true, message: 'Obrigatório' }]} initialValue={isGestor ? user?.cnpj : undefined}>
            <Input placeholder="00.000.000/0000-00" disabled={isGestor} />
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
    </Card>
  );
};

export default UsuarioManager;
