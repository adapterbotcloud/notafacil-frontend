import * as XLSX from 'xlsx';
import { Cobranca, ResumoFinanceiro } from '../types/Cobranca';

const HEADER_ROW = 8; // linha 9 no Excel (0-indexed = 8)

export function parseCobrancas(file: File): Promise<{ resumo: ResumoFinanceiro; cobrancas: Cobranca[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const raw: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

        // Extrair resumo (linhas 1-6)
        const resumo: ResumoFinanceiro = {
          cnpj: raw[1]?.[0] || '',
          nomeCarteira: raw[1]?.[1] || '',
          razaoSocial: raw[1]?.[2] || '',
          valorPrevisto: raw[5]?.[0] || 0,
          pago: raw[5]?.[1] || 0,
          pagoBoleto: raw[5]?.[2] || 0,
          pagoCartao: raw[5]?.[3] || 0,
          pagoPix: raw[5]?.[4] || 0,
          pagoEscola: raw[5]?.[5] || 0,
          enviado: raw[5]?.[6] || 0,
          pendente: raw[5]?.[7] || 0,
          atrasado: raw[5]?.[8] || 0,
        };

        // Extrair cobranças (a partir da linha 10)
        const cobrancas: Cobranca[] = [];
        for (let i = HEADER_ROW + 1; i < raw.length; i++) {
          const row = raw[i];
          if (!row || !row[0]) continue; // pular linhas vazias

          // Filtrar apenas cobranças com título contendo 'MENSALIDADE'
          const titulo = (row[7] || '').toString().toUpperCase();
          if (!titulo.includes('MENSALIDADE')) continue;

          cobrancas.push({
            idAluno: row[0],
            nomeAluno: row[1] || '',
            idResponsavel: row[2],
            responsavel: row[3] || '',
            cpfResponsavel: row[4] || '',
            unidade: row[5] || '',
            turma: row[6] || '',
            titulo: row[7] || '',
            carteiraDestino: row[8] || '',
            idCobranca: row[9],
            idPlano: row[10],
            metodosHabilitados: row[11] || '',
            valorCobrado: row[12] || 0,
            valorPago: row[13] || 0,
            possuiMultasJuros: row[14] || '',
            multasJuros: row[15] || 0,
            possuiDesconto: row[16] || '',
            desconto: row[17] || 0,
            taxaCobranca: row[18] || 0,
            possuiAntecipacao: row[19] || '',
            taxaAntecipacao: row[20] || 0,
            valorRecebido: row[21] || 0,
            dataEnvio: row[22] || '',
            dataPagamento: row[23] || '',
            vencimento: row[24] || '',
            situacao: row[25] || '',
            metodoPagamento: row[26] || '',
          });
        }

        resolve({ resumo, cobrancas });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
