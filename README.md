# 🐝 JUSC - Gestão de Equipes de Trabalho

Sistema moderno, fluido e intuitivo para criação, gerenciamento e alocação de equipes de trabalho para encontros e retiros do **JUSC (Jovens Unidos Seguindo Cristo)**.

Desenvolvido com foco na identidade visual do JUSC (amarelo ouro `#FFC700` e preto grafite), alta usabilidade com arrastar-e-soltar (*drag-and-drop*), banco de dados persistente SQLite (com WAL mode), autenticação de acesso com JWT e relatórios exportáveis em PDF e Excel (.xlsx).

---

## 🌟 Funcionalidades Principais

- 👥 **Banco de Pessoas & Voluntários**:
  - Categorias: `Coordenação`, `Integrantes`, `Tios`, `PJ`, `Veteranos`, `Voluntários`.
  - Níveis de Prioridade de Alocação de 0 a 3 (com filtros dedicados).
  - Busca em tempo real e filtros de status (Alocados, Disponíveis, etc.).
- 🛡️ **Gestão de Equipes e Funções**:
  - Cadastro de equipes com descrição e personalização livre de cores (paletas e seletor de cor hexadecimal).
  - Funções de trabalho com descrição detalhada de atribuições e controle de vagas (limite máximo ou ilimitado).
  - Reordenação interativa de equipes e funções (arrastar ou botões de seta).
  - Alternância de visualização: 1 Coluna (com divisão interna em 2 colunas para maior visibilidade), 2 Colunas ou 3 Colunas.
- 🎯 **Alocação por Drag-and-Drop**:
  - Arraste pessoas diretamente da lista lateral para qualquer função.
  - Remova ou mova facilmente entre equipes.
- 📊 **Métricas e Painel de Vagas no Topo**:
  - Contadores de Vagas Preenchidas, Vagas Abertas Restantes e ocupação total.
- 📑 **Exportações Profissionais**:
  - Escala de Equipes em PDF e Planilha Excel (.xlsx).
  - Relatório completo do Banco de Pessoas em PDF (modo paisagem A4) e Excel (.xlsx).
- 🔒 **Segurança & Autenticação**:
  - Tela de login com JWT e senhas com hash `bcrypt`.
  - Credenciais padrão: `admin@jusc.com.br` / `jusc2026`.
- 💾 **Persistência de Dados**:
  - Banco de dados SQLite persistido no volume `./data/jusc.db` com journaling em modo WAL.
  - Sistema de backup e restauração manual em JSON pelo painel.

---

## 🚀 Deploy Rápido na VPS (Clone & Run)

Para subir o sistema no seu servidor Linux apontado para **`jusctrabalho.tccodes.com.br`**:

```bash
# 1. Clone o repositório no servidor
git clone https://github.com/ThiagoCCarmona/jusc-equipes.git /opt/jusc-equipes

# 2. Acesse a pasta do projeto
cd /opt/jusc-equipes

# 3. Execute o script de deploy automatizado
chmod +x deploy.sh
./deploy.sh
```

O script `deploy.sh` irá:
1. Verificar/instalar o Docker e Docker Compose automaticamente;
2. Criar o arquivo de ambiente `.env` configurado com as portas e domínio;
3. Criar a pasta persistente `./data` do banco SQLite;
4. Compilar e subir os containers da aplicação e do Nginx (`docker compose up -d --build`).

Para o guia passo a passo completo (incluindo SSL Let's Encrypt e apontamento DNS), veja o [DEPLOY.md](./DEPLOY.md).

---

## 💻 Execução Local para Desenvolvimento

```bash
# Instalar dependências
npm install
cd server && npm install && cd ..

# Iniciar Frontend (Vite)
npm run dev

# Iniciar Backend (Node + SQLite)
npm run start:server
```

---

## 📄 Licença

Uso exclusivo para o movimento **JUSC - Jovens Unidos Seguindo Cristo**.
