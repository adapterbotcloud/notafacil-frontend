const API_BASE = process.env.REACT_APP_API_URL || 'https://notafacil-api.adapterbot.cloud/api/v1';

function getToken(): string | null {
  try {
    const stored = localStorage.getItem('notafacil_user');
    if (stored) return JSON.parse(stored).token;
  } catch {}
  return null;
}

function headers() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface EmpresaDTO {
  id?: number;
  cnpj: string;
  razaoSocial?: string;
  inscricaoMunicipal: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  telefone?: string;
  aliquota: number;
  itemListaServico: string;
  codigoTributacaoMunicipio: string;
  codigoMunicipio: string;
  regimeEspecialTributacao: number;
  optanteSimplesNacional: number;
  incentivadorCultural: number;
  substitutoTributario?: boolean;
}

export async function listarEmpresas(): Promise<EmpresaDTO[]> {
  const resp = await fetch(`${API_BASE}/empresas`, { headers: headers() });
  if (!resp.ok) throw new Error('Erro ao listar empresas');
  return resp.json();
}

export async function criarEmpresa(empresa: EmpresaDTO): Promise<EmpresaDTO> {
  const resp = await fetch(`${API_BASE}/empresas`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(empresa),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || 'Erro ao criar empresa');
  return data;
}

export async function atualizarEmpresa(id: number, empresa: Partial<EmpresaDTO>): Promise<EmpresaDTO> {
  const resp = await fetch(`${API_BASE}/empresas/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(empresa),
  });
  if (!resp.ok) throw new Error('Erro ao atualizar empresa');
  return resp.json();
}
