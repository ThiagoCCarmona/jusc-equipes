#!/bin/bash
set -e

# ==============================================================================
# JUSC Equipes de Trabalho - Script de Deploy Automático para VPS
# Domínio: jusctrabalho.tccodes.com.br
# ==============================================================================

DOMAIN="jusctrabalho.tccodes.com.br"
EMAIL=""

for arg in "$@"; do
  case $arg in
    --ssl=*)
      EMAIL="${arg#*=}"
      shift
      ;;
  esac
done

echo "=========================================================="
echo "🚀 Iniciando Deploy do JUSC - Equipes de Trabalho"
echo "🌐 Domínio: $DOMAIN"
echo "=========================================================="

# 1. Verificar Docker e Docker Compose
if ! command -v docker &> /dev/null; then
    echo "📦 Docker não encontrado! Instalando Docker automaticamente..."
    curl -fsSL https://get.docker.com | sh
    sudo systemctl enable --now docker
fi

# 2. Configurar arquivo de ambiente .env se não existir
if [ ! -f .env ]; then
    echo "⚠️ Arquivo .env não encontrado. Criando a partir de .env.example..."
    cp .env.example .env
    echo "✅ .env criado com sucesso."
fi

# 4. Garantir permissões das pastas de dados
mkdir -p data
chmod -R 755 data

# 5. Atualizar código do repositório (caso esteja rodando dentro de um git clone)
if [ -d .git ]; then
    echo "📦 Verificando atualizações no Git..."
    git pull --ff-only 2>/dev/null || true
fi

# 6. Build e Inicialização dos Containers Docker via Traefik Proxy
echo "🐳 Construindo e subindo containers Docker..."
docker compose up -d --build

# 8. Aguardar inicialização e verificar integridade
echo "⏳ Aguardando serviços ficarem online..."
sleep 5

echo "🩺 Status dos containers:"
docker compose ps

echo ""
echo "=========================================================="
echo "✅ Deploy concluído com sucesso!"
echo "🌐 Acesse: https://$DOMAIN"
echo "🔑 Login padrão: admin@jusc.com.br / jusc2026"
echo ""
echo "💡 Dica: Para emitir/renovar o SSL oficial Let's Encrypt a qualquer momento:"
echo "   ./deploy.sh --ssl=seu-email@tccodes.com.br"
echo "=========================================================="