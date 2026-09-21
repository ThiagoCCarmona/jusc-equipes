#!/bin/bash
set -e

# ==============================================================================
# JUSC Equipes de Trabalho - Script de Deploy Automático para VPS
# Domínio: jusctrabalho.tccodes.com.br
# ==============================================================================

echo "=========================================================="
echo "🚀 Iniciando Deploy do JUSC - Equipes de Trabalho"
echo "=========================================================="

# 1. Verificar Docker e Docker Compose
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não foi encontrado! Instalando Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo systemctl enable --now docker
fi

# 2. Configurar arquivo de ambiente .env se não existir
if [ ! -f .env ]; then
    echo "⚠️ Arquivo .env não encontrado. Criando a partir de .env.example..."
    cp .env.example .env
    echo "✅ .env criado. Recomendado revisar as credenciais com: nano .env"
fi

# 3. Garantir que as pastas persistentes existam com permissões adequadas
mkdir -p data certbot/conf certbot/www
chmod -R 755 data

# 4. Atualizar código do repositório (caso esteja rodando dentro de um git clone)
if [ -d .git ]; then
    echo "📦 Atualizando repositório Git..."
    git pull --ff-only || echo "Aviso: Git pull ignorado (alterações locais detectadas)"
fi

# 5. Build e Inicialização dos Containers Docker
echo "🐳 Construindo e iniciando containers Docker..."
docker compose down --remove-orphans || true
docker compose up -d --build

# 6. Aguardar inicialização e verificar integridade
echo "⏳ Aguardando serviços ficarem online..."
sleep 6

echo "🩺 Verificando status dos containers:"
docker compose ps

echo ""
echo "=========================================================="
echo "✅ Deploy concluído com sucesso!"
echo "🌐 Acesse: https://jusctrabalho.tccodes.com.br"
echo "🔑 Login padrão: admin@jusc.com.br / jusc2026"
echo "=========================================================="