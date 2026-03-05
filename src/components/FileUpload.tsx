import React, { useState } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined, FileExcelOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { parseCobrancas } from '../utils/parseXlsx';
import { Cobranca, ResumoFinanceiro } from '../types/Cobranca';

interface FileUploadProps {
  onDataParsed: (resumo: ResumoFinanceiro, cobrancas: Cobranca[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataParsed }) => {
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleUpload = async (file: File) => {
    setLoading(true);
    try {
      const { resumo, cobrancas } = await parseCobrancas(file);
      message.success(`${cobrancas.length} cobranças extraídas com sucesso!`);
      onDataParsed(resumo, cobrancas);
    } catch (err) {
      message.error('Erro ao processar a planilha. Verifique o formato.');
      console.error(err);
    } finally {
      setLoading(false);
    }
    return false; // prevent default upload
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      border: '2px dashed #1677ff',
      borderRadius: 12,
      backgroundColor: '#fafafa',
      marginBottom: 24,
    }}>
      <FileExcelOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
      <h2 style={{ marginBottom: 8 }}>Upload da Planilha de Cobranças</h2>
      <p style={{ color: '#888', marginBottom: 24 }}>
        Selecione um arquivo .xlsx ou .xls com o relatório de cobranças
      </p>
      <Upload
        accept=".xlsx,.xls"
        fileList={fileList}
        beforeUpload={(file) => {
          setFileList([file as any]);
          handleUpload(file);
          return false;
        }}
        onRemove={() => setFileList([])}
        maxCount={1}
      >
        <Button
          type="primary"
          icon={<UploadOutlined />}
          loading={loading}
          size="large"
        >
          Selecionar Planilha
        </Button>
      </Upload>
    </div>
  );
};

export default FileUpload;
