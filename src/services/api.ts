const API_BASE = process.env.REACT_APP_API_URL || 'https://notafacil-api.adapterbot.cloud/api/v1';

function getToken(): string | null {
  try {
    const stored = localStorage.getItem('notafacil_user');
    if (stored) return JSON.parse(stored).token;
  } catch {}
  return null;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const { headers: extraHeaders, ...restOptions } = options || {};
  const token = getToken();

  const res = await fetch(`${API_BASE}${url}`, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(extraHeaders as Record<string, string>),
    },
  });

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('notafacil_user');
    window.location.reload();
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  if (!res.ok) {
    let msg = `Erro ${res.status}`;
    try {
      const json = await res.json();
      if (json.error) msg = json.error;
      else if (json.message) msg = json.message;
      if (json.details) msg += ' | ' + json.details.join(' | ');
    } catch {
      try {
        const text = await res.text();
        if (text) msg = text;
      } catch {}
    }
    throw new Error(msg);
  }
  return res.json();
}

export function recepcionarLoteRps(payload: any) {
  return request('/nfse/recepcionar-lote-rps', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function consultarSituacaoLoteRps(protocolo: string) {
  return request(`/nfse/consulta-situacao-lote-rps/${protocolo}`);
}

export function consultarLoteRps(protocolo: string) {
  return request(`/nfse/consulta-lote-rps/${protocolo}`);
}

export function emitirRps(listaRps: any[]) {
  return request('/nfse/emitir-rps', {
    method: 'POST',
    body: JSON.stringify({ listaRps }),
  });
}

export interface RpsTesteItem {
  id: number;
  servico: {
    valorServicos: number;
    discriminacao: string;
  };
  tomador: {
    cpf: string;
    razaoSocial: string;
  };
}

export function emitirRpsTeste(empresaCnpj: string, listaRps: RpsTesteItem[]) {
  return request('/nfse/emitir-rps-teste', {
    method: 'POST',
    headers: { 'X-Empresa-CNPJ': empresaCnpj } as any,
    body: JSON.stringify({ listaRps }),
  });
}

export async function importarCertificado(file: File, name: string, password: string) {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', name);
  formData.append('password', password);

  const res = await fetch(`${API_BASE.replace('/api/v1', '')}/certificates/import`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.text();
}

// Verificar quais idCobranca já possuem RPS
export async function verificarRpsExistentes(idCobrancas: number[]): Promise<number[]> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/nfse/rps-existentes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(idCobrancas),
  });
  if (!res.ok) return [];
  return res.json();
}
