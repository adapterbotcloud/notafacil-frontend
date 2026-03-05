# 📝 NotaFácil - Frontend

Interface web para o sistema de emissão de **NFS-e** (Nota Fiscal de Serviço Eletrônica).

## 🚀 Tecnologias

- **React 18** + **TypeScript**
- **Ant Design 5** (componentes UI)
- **SheetJS (xlsx)** (leitura de planilhas)
- **jsPDF + autoTable** (geração de PDF)
- **Create React App** (toolchain)

## 📋 Pré-requisitos

- Node.js 18+
- npm 9+

## ⚙️ Configuração

### Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `REACT_APP_API_URL` | `https://notafacil-api.adapterbot.cloud/api/v1` | URL base da API backend |

Para desenvolvimento local:

```bash
echo 'REACT_APP_API_URL=http://localhost:8081/api/v1' > .env.local
```

## 🏃 Executando

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm start

# Build produção
npm run build

# Servir build
npx serve -s build -l 3001
```

## 🔐 Login

O sistema exige autenticação. Credenciais padrão:

| Campo | Valor |
|-------|-------|
| Usuário | `admin` |
| Senha | `admin123` |

> ⚠️ **Troque a senha padrão em produção!**

## 📱 Funcionalidades

### 📤 Upload de Planilha
- Upload de arquivos `.xlsx` ou `.xls`
- Extração automática dos dados de cobranças
- Exibição do resumo financeiro (valor previsto, pago, pendente, atrasado)
- Tabela com todas as cobranças, busca e filtros

### 📨 Recepcionar Lote RPS
- Formulário completo para enviar lote de RPS
- Adição dinâmica de múltiplos RPS
- Dados do prestador e tomador
- Visualização do resultado em JSON

### 🔍 Consultar Situação do Lote
- Consulta por número de protocolo
- Exibição da resposta da prefeitura

### 📋 Consultar Lote RPS
- Consulta detalhada por protocolo
- Exibição dos dados completos do lote

### ⚡ Emitir RPS (Assíncrono)
- Formulário para emissão de RPS em lote
- Processamento assíncrono no backend

### ⚡ Emitir RPS
- **Habilitado somente após upload da planilha**
- Dados preenchidos automaticamente da planilha:
  - `razaoSocial` ← Responsável
  - `cpf` ← CPF do responsável (sem máscara)
  - `discriminacao` ← Título + mês/ano do envio
  - `valorServicos` ← Valor pago
- **CNPJ da empresa** obtido do JWT do usuário logado
- **Deduplicação** por `idCobranca`:
  - 🔵 **Pronto** — cobrança válida, pode enviar
  - 🟠 **Inválida** — valor R$ 0, CPF ou nome ausente (tooltip com motivo)
  - 🟢 **Já Enviada** — RPS já gerado (checkbox desabilitado)
- Seleção: por página, todos válidos ou individual
- Filtros por situação e status RPS
- Linhas com cores visuais por status

### 📊 RPS Emitidos
- Listagem de todos os RPS salvos no banco
- Filtro por **ano** e **mês da cobrança** (competência)
- Cards de resumo: total, valor, pendentes, enviados, falhas
- **Geração de PDF** (relatório landscape A4)
- Coluna de competência (MM/AAAA)

### 🔐 Importar Certificado Digital (ADMIN e GESTOR)
- Upload de arquivo `.p12` ou `.pfx`
- Informar nome e senha do certificado

### 👥 Gestão de Usuários (ADMIN e GESTOR)
- Listar, criar, editar e remover usuários
- Campos: username, senha, nome, CNPJ, perfil (ADMIN/GESTOR/USER)
- **GESTOR**: CNPJ preenchido automaticamente, só cria USER/GESTOR, opção ADMIN oculta
- Vários usuários podem pertencer à mesma empresa (mesmo CNPJ)
- CNPJ formatado automaticamente na exibição

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── CobrancaTable.tsx        # Tabela de cobranças com filtros
│   ├── FileUpload.tsx           # Área de upload de planilha
│   ├── ResumoCard.tsx           # Cards com resumo financeiro
│   ├── RpsListagem.tsx          # Listagem de RPS com PDF
│   ├── UsuarioManager.tsx       # CRUD de usuários
│   └── nfse/
│       ├── ConsultaLote.tsx     # Consultar lote RPS
│       ├── ConsultaSituacao.tsx # Consultar situação do lote
│       ├── EmitirRps.tsx        # Emitir RPS (assíncrono)
│       ├── EmitirRpsTeste.tsx   # Emitir RPS teste (síncrono)
│       ├── ImportarCertificado.tsx
│       ├── RecepcionarLote.tsx  # Recepcionar lote RPS
│       └── ResultViewer.tsx     # Visualizador de resultado JSON
├── contexts/
│   └── AuthContext.tsx          # Contexto de autenticação JWT
├── pages/
│   └── LoginPage.tsx            # Tela de login
├── services/
│   ├── api.ts                   # Chamadas à API (NFS-e + certificado)
│   └── usuarioApi.ts            # Chamadas à API (CRUD usuários)
├── types/
│   └── Cobranca.ts              # Tipos TypeScript (Cobranca, ResumoFinanceiro)
├── utils/
│   └── parseXlsx.ts             # Parser de planilha xlsx/xls
├── App.tsx                      # Componente principal com abas
├── index.tsx                    # Entry point
└── index.css                    # Estilos customizados
```

## 🌐 Deploy

### Systemd

```bash
# Criar serviço
sudo nano /etc/systemd/system/notafacil-frontend.service

# Conteúdo:
[Unit]
Description=NotaFacil Frontend
After=network.target

[Service]
Type=simple
WorkingDirectory=/root/notafacil-frontend
ExecStart=/usr/bin/npx serve -s build -l 3001
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target

# Ativar e iniciar
sudo systemctl daemon-reload
sudo systemctl enable notafacil-frontend
sudo systemctl start notafacil-frontend
```

### Caddy (reverse proxy)

```
notafacil.adapterbot.cloud {
    reverse_proxy localhost:3001
}
```

## 🔗 Links

| Recurso | URL |
|---------|-----|
| Frontend | https://notafacil.adapterbot.cloud |
| Backend API | https://notafacil-api.adapterbot.cloud |
| Swagger | https://notafacil-api.adapterbot.cloud/swagger-ui.html |
| Health Check | https://notafacil-api.adapterbot.cloud/actuator/health |

## 📌 Versão

**v1.1.0** — Perfil GESTOR, listagem de RPS com filtro por competência, geração de PDF, favicon customizado.

## 📄 Licença

Projeto privado — uso interno.
