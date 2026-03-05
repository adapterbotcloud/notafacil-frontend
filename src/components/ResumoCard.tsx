import React from 'react';
import { Card, Row, Col, Statistic, Tag } from 'antd';
import {
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { ResumoFinanceiro } from '../types/Cobranca';

interface ResumoCardProps {
  resumo: ResumoFinanceiro;
}

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const ResumoCard: React.FC<ResumoCardProps> = ({ resumo }) => {
  return (
    <Card
      title={
        <div>
          <strong>{resumo.razaoSocial}</strong>
          <Tag color="blue" style={{ marginLeft: 12 }}>CNPJ: {resumo.cnpj}</Tag>
        </div>
      }
      style={{ marginBottom: 24 }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} md={6}>
          <Statistic
            title="Valor Previsto"
            value={resumo.valorPrevisto}
            precision={2}
            prefix={<DollarOutlined />}
            formatter={(v) => formatCurrency(Number(v))}
          />
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Statistic
            title="Pago"
            value={resumo.pago}
            precision={2}
            valueStyle={{ color: '#3f8600' }}
            prefix={<CheckCircleOutlined />}
            formatter={(v) => formatCurrency(Number(v))}
          />
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Statistic
            title="Pago PIX"
            value={resumo.pagoPix}
            precision={2}
            formatter={(v) => formatCurrency(Number(v))}
          />
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Statistic
            title="Pago Boleto"
            value={resumo.pagoBoleto}
            precision={2}
            formatter={(v) => formatCurrency(Number(v))}
          />
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Statistic
            title="Pendente"
            value={resumo.pendente}
            precision={2}
            valueStyle={{ color: '#faad14' }}
            prefix={<ClockCircleOutlined />}
            formatter={(v) => formatCurrency(Number(v))}
          />
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Statistic
            title="Atrasado"
            value={resumo.atrasado}
            precision={2}
            valueStyle={{ color: '#cf1322' }}
            prefix={<ExclamationCircleOutlined />}
            formatter={(v) => formatCurrency(Number(v))}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default ResumoCard;
