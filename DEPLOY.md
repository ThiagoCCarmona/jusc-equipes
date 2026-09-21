# 🚀 Guia de Deploy - JUSC Equipes de Trabalho

Guia completo para colocar em produção o sistema **JUSC - Equipes de Trabalho** no domínio **`jusctrabalho.tccodes.com.br`** utilizando Docker, banco de dados persistente SQLite (com WAL mode) e autenticação segura com JWT.

---

## 📋 Sumário de Arquitetura

- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS (otimizado e compilado para produção).
- **Backend**: Node.js + Express + TypeScript com rotas REST e autenticação JWT.
- **Banco de Dados**: SQLite com WAL (*Write-Ahead Logging*) persistido no volume `./data/jusc.db`.
- **Servidor Web & Proxy Reverso**: Nginx com suporte a HTTPS/SSL (Let's Encrypt) e gzip.
- **Domínio Configurado**: `jusctrabalho.tccodes.com.br`

---

## 1️⃣ Passo 1: Apontamento de DNS

No painel onde você gerencia o domínio `tccodes.com.br` (ex: Cloudflare, Registro.br, Hostinger, etc.):

1. Adicione um registro DNS do tipo **A**:
   - **Tipo**: `A`
   - **Nome / Subdomínio**: `jusctrabalho`
   - **Destino / IP**: IP público da sua máquina / VPS Linux (ex: `198.51.100.25`)
   - **TTL**: Automático ou 300s (5 minutos)
   - *(Se usar Cloudflare, no primeiro momento deixe a nuvem cinza / DNS Only para facilitar a emissão do certificado Let's Encrypt, ou configure SSL Completo/Strict).*

---

## 2️⃣ Passo 2: Preparar o Servidor VPS (Linux Ubuntu/Debian)

Acesse seu servidor via SSH:
```bash
ssh root@SEU_IP_DO_SERVIDOR
```

Instale o Docker e o Docker Compose (caso ainda não estejam instalados):
```bash
# Atualizar pacotes
sudo apt update && sudo apt upgrade -y

# Instalar dependências e Docker
curl -fsSL https://get.docker.com | sh

# Habilitar e iniciar Docker
sudo systemctl enable --now docker
```

---

## 3️⃣ Passo 3: Enviar os Arquivos do Projeto para o Servidor

Você pode clonar via Git ou enviar os arquivos da pasta do projeto para o diretório `/opt/jusc-equipes`:

```bash
mkdir -p /opt/jusc-equipes
cd /opt/jusc-equipes
```

Envie os arquivos ou clone seu repositório:
```bash
# Exemplo com Git:
git clone <URL_DO_REPOSITORIO> .
```

---

## 4️⃣ Passo 4: Configurar as Variáveis de Ambiente

Crie o arquivo `.env` a partir do modelo:
```bash
cp .env.example .env
nano .env
```

Ajuste as configurações recomendadas:
```env
DOMAIN=jusctrabalho.tccodes.com.br
PORT=3001
JWT_SECRET=coloque_aqui_uma_chave_longa_e_aleatoria_para_seguranca_2026
ADMIN_EMAIL=admin@jusc.com.br
ADMIN_PASSWORD=sua_senha_segura_aqui
DATA_DIR=/app/data
DB_PATH=/app/data/jusc.db
```
*(Salve com `Ctrl+O` e saia com `Ctrl+X`)*.

---

## 5️⃣ Passo 5: Gerar Certificado SSL (Let's Encrypt / HTTPS)

Para gerar o certificado SSL gratuito do Let's Encrypt para `jusctrabalho.tccodes.com.br`:

```bash
# Crie as pastas para o Certbot
mkdir -p certbot/conf certbot/www

# Execute o certbot em modo standalone para gerar o primeiro certificado
docker run -it --rm --name certbot \
  -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
  -v "$(pwd)/certbot/www:/var/www/certbot" \
  -p 80:80 \
  certbot/certbot certonly --standalone \
  -d jusctrabalho.tccodes.com.br \
  --email seu-email@tccodes.com.br \
  --agree-tos \
  --no-eff-email
```

> **Nota**: Caso utilize um Proxy Reverso já existente no seu servidor (como **Nginx Proxy Manager**, **Traefik**, **Caddy** ou **Cloudflare SSL**), pule esta etapa e veja a seção *Implantação Alternativa com Proxy Reverso Existente* abaixo.

---

## 6️⃣ Passo 6: Subir os Containers com Docker Compose

Com o certificado emitido e o `.env` configurado, basta executar:

```bash
docker compose up -d --build
```

Verifique se todos os serviços subiram:
```bash
docker compose ps
```

Veja os logs da aplicação:
```bash
docker compose logs -f app
```

Acesse no navegador:
👉 **`https://jusctrabalho.tccodes.com.br`**

---

## 🔑 Credenciais de Acesso Padrão

- **E-mail**: `admin@jusc.com.br` (ou o que definiu no `.env`)
- **Senha**: `jusc2026` (ou o que definiu no `.env`)

---

## 🔀 Opção Alternativa: Usando Nginx Proxy Manager, Cloudflare Tunnel ou Traefik

Se o seu servidor já possui outro proxy reverso (como Nginx Proxy Manager, EasyPanel, Coolify, CapRover ou Traefik gerenciando as portas 80/443), você só precisa rodar o container `app`:

```bash
# Executar apenas o container da aplicação na porta 3001
docker compose up -d --build app
```

E no seu painel de Proxy Reverso:
- **Domínio**: `jusctrabalho.tccodes.com.br`
- **Destino (Forward Host/IP)**: `127.0.0.1` ou o nome do container
- **Porta**: `3001`
- **Websockets Support**: Ativado
- **SSL**: Let's Encrypt automático via painel

---

## 💾 Backup e Persistência do Banco de Dados

Todos os dados (usuários, equipes, funções, voluntários, prioridades e atribuições) ficam salvos no arquivo:
```
./data/jusc.db
```

### 1. Backup Manual pelo Sistema
No próprio cabeçalho do sistema, clique no ícone de **Configurações/Engrenagem** para exportar um arquivo `.json` completo de backup que pode ser restaurado a qualquer momento.

### 2. Backup Automático no Servidor (Rotina Diária via Cron)
Crie um script simples para backup diário do banco SQLite:
```bash
crontab -e
```
Adicione a linha para fazer backup todos os dias às 03:00 da manhã:
```cron
0 3 * * * cp /opt/jusc-equipes/data/jusc.db /opt/jusc-equipes/data/jusc_backup_$(date +\%Y\%m\%d).db
```

---

## 🔄 Como Atualizar o Sistema no Futuro

Quando fizer alterações no código e subir para o servidor:
```bash
cd /opt/jusc-equipes
git pull
docker compose up -d --build
```
Como o banco de dados está no volume `./data`, **nenhum dado ou cadastro será perdido** durante as atualizações.

---

## 🩺 Verificação de Saúde (Health Check)

O sistema possui uma rota de diagnóstico para monitoramento e uptime:
```bash
curl https://jusctrabalho.tccodes.com.br/api/health
```
Resposta esperada:
```json
{
  "status": "ok",
  "uptime": 1234,
  "timestamp": "2026-09-21T14:40:00.000Z",
  "domain": "jusctrabalho.tccodes.com.br"
}
```
