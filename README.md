# 📝 NotaFácil - Frontend

Interface web para emissão de **NFS-e** (Nota Fiscal de Serviço Eletrônica) — Fortaleza/CE.

## 🚀 Tecnologias

- **React 18** + **TypeScript**
- **Ant Design 5** (componentes UI)
- **jsPDF** + **jspdf-autotable** (geração de PDF)
- **XLSX** (leitura de planilhas)

## 📋 Funcionalidades

### Abas do Sistema

| Aba | Acesso | Descrição |
|-----|--------|-----------|
| **Upload Planilha** | Todos | Upload de planilha de cobranças (.xlsx), parsing e validação |
| **Emitir RPS** | Todos* | Envio de RPS para SEFIN (*requer upload + certificado importado) |
| **RPS Emitidos** | Todos | Listagem com filtros (ano, mês, status), resumo, PDF, reenvio |
| **Certificado** | Todos | Status do certificado digital (ADMIN/GESTOR: importar/atualizar) |
| **Usuários** | ADMIN/GESTOR | Gestão de usuários (CRUD) |

### Destaques

- **Deduplicação**: Verifica RPS existentes antes de emitir (por idCobrança)
- **Validação visual**: Cobranças inválidas (valor=0, CPF vazio) marcadas em vermelho
- **Job status**: Alerta em tempo real do monitoramento de protocolos (polling 30s)
- **Reenvio**: Botão para reenviar RPS com status Pendente/Falha
- **Tooltip de erro**: Hover no status mostra mensagem de erro da SEFIN
- **Filtro por status**: Pendente, Enviando, Enviado, Falha, Processado
- **PDF**: Relatório de RPS emitidos por competência
- **Responsivo**: Layout adaptado para mobile, tablet e desktop
- **Logo personalizada**: Header e tela de login

### Regras de Negócio (Frontend)

- Aba "Emitir RPS" bloqueada sem upload ou sem certificado (tooltip com motivo)
- USER vê certificado somente leitura
- GESTOR não vê/edita usuários ADMIN nem altera CNPJ

## ⚙️ Configuração

```bash
# .env
REACT_APP_API_URL=https://notafacil-api.adapterbot.cloud/api/v1
```

## 🏃 Executando

```bash
npm install
npm start        # dev (porta 3000)
npm run build    # produção
```

## 🌐 Deploy

- **URL**: `https://notafacil.adapterbot.cloud`
- **Porta**: 3001 (serve -s build)
- **Serviço**: `systemctl restart notafacil-frontend`
- **Proxy**: Caddy reverse proxy

## 📌 Versão: v1.3.0

- **v1.3.0** — Logo personalizada, layout responsivo, filtro por status, certificado visível para USER (read-only), bloqueio de emissão sem certificado
- **v1.2.0** — Job status, reenvio, tooltip erro, deduplicação visual
- **v1.1.0** — Perfil GESTOR, PDF, filtro competência
- **v1.0.0** — MVP login + upload + emissão
