export interface Cobranca {
  idAluno: number;
  nomeAluno: string;
  idResponsavel: number;
  responsavel: string;
  cpfResponsavel: string;
  unidade: string;
  turma: string;
  titulo: string;
  carteiraDestino: string;
  idCobranca: number;
  idPlano: number;
  metodosHabilitados: string;
  valorCobrado: number;
  valorPago: number;
  possuiMultasJuros: string;
  multasJuros: number;
  possuiDesconto: string;
  desconto: number;
  taxaCobranca: number;
  possuiAntecipacao: string;
  taxaAntecipacao: number;
  valorRecebido: number;
  dataEnvio: string;
  dataPagamento: string;
  vencimento: string;
  situacao: string;
  metodoPagamento: string;
}

export interface ResumoFinanceiro {
  cnpj: string;
  nomeCarteira: string;
  razaoSocial: string;
  valorPrevisto: number;
  pago: number;
  pagoBoleto: number;
  pagoCartao: number;
  pagoPix: number;
  pagoEscola: number;
  enviado: number;
  pendente: number;
  atrasado: number;
}
