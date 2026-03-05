import React from 'react';
import { Card, Typography } from 'antd';

const { Text } = Typography;

interface ResultViewerProps {
  data: any;
}

const ResultViewer: React.FC<ResultViewerProps> = ({ data }) => {
  if (!data) return null;

  return (
    <Card
      size="small"
      title="📄 Resposta"
      style={{ marginTop: 16, background: '#f6f8fa' }}
    >
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 13 }}>
        <Text code>{JSON.stringify(data, null, 2)}</Text>
      </pre>
    </Card>
  );
};

export default ResultViewer;
