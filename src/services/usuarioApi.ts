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
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

export interface UsuarioDTO {
  id?: number;
  username: string;
  nome: string;
  cnpj: string;
  role: string;
  password?: string;
}

export async function listarUsuarios(): Promise<UsuarioDTO[]> {
  const res = await fetch(`${API_BASE}/usuarios`, { headers: headers() });
  if (!res.ok) throw new Error('Erro ao listar usuários');
  return res.json();
}

export async function criarUsuario(data: UsuarioDTO): Promise<UsuarioDTO> {
  const res = await fetch(`${API_BASE}/usuarios`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.message || 'Erro ao criar usuário');
  }
  return res.json();
}

export async function atualizarUsuario(id: number, data: Partial<UsuarioDTO>): Promise<UsuarioDTO> {
  const res = await fetch(`${API_BASE}/usuarios/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.message || 'Erro ao atualizar usuário');
  }
  return res.json();
}

export async function deletarUsuario(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/usuarios/${id}`, {
    method: 'DELETE',
    headers: headers(),
  });
  if (!res.ok) throw new Error('Erro ao deletar usuário');
}
