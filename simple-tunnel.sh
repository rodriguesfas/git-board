#!/bin/bash

# Cores para o terminal
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🌐 Git Board - Túnel Público"
echo ""

# Verificar se os serviços já estão rodando
if ! docker-compose -f docker-compose.yml ps | grep -q "Up"; then
    echo "📦 Iniciando serviços Docker..."
    make up > /dev/null 2>&1
    sleep 5
fi

echo "✅ Serviços iniciados!"
echo "📊 Dashboard: http://localhost:3000"
echo "🔌 API: http://localhost:8000"
echo "🌐 Nginx: http://localhost"
echo ""

echo "🌍 Testando túneis públicos..."
echo ""

# Testar serveo.net primeiro (mais confiável)
echo "📡 Testando serveo.net..."
ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 -R 80:localhost:80 serveo.net > .tunnel.log 2>&1 &
SSH_PID=$!

sleep 8

TUNNEL_URL=$(grep "Forwarding HTTP traffic from" .tunnel.log | grep -o 'https://[^[:space:]]*' | head -1)

if [ -n "$TUNNEL_URL" ]; then
    echo "✅ serveo.net funcionando!"
    echo ""
    echo "🌍 URLs públicas (prontas para usar):"
    echo "   📊 Dashboard: $TUNNEL_URL"
    echo "   🔌 API: $TUNNEL_URL/api"
    echo "   🔗 Webhook: $TUNNEL_URL/index_json.php"
    echo ""
    echo "🎉 Pronto! Use a URL do webhook no GitHub."
    echo ""
    echo "🎯 Configuração no GitHub:"
    echo "   1. Vá para Settings > Webhooks > Add webhook"
    echo "   2. Use: $TUNNEL_URL/index_json.php"
    echo "   3. Content type: application/json"
    echo "   4. Events: push, pull_request, issues"
    echo ""
    echo "💡 Para parar: Ctrl+C ou 'make down'"
    echo ""
    echo "🔄 Túnel rodando em background (PID: $SSH_PID)"
    
    # Salvar PID
    echo $SSH_PID > .tunnel.pid
    
    # Manter script ativo
    echo ""
    echo "Pressione Ctrl+C para parar o túnel..."
    
    # Aguardar sinal de parada
    trap 'echo ""; echo "🛑 Parando túnel..."; kill $SSH_PID 2>/dev/null; rm -f .tunnel.pid .tunnel.log; echo "✅ Túnel parado!"; exit 0' INT
    
    # Manter script rodando
    while kill -0 $SSH_PID 2>/dev/null; do
        sleep 1
    done
else
    echo "❌ serveo.net não funcionou."
    kill $SSH_PID 2>/dev/null
    
    echo ""
    echo "📋 Opções manuais:"
    echo ""
    echo "1. serveo.net (recomendado):"
    echo "   ssh -R 80:localhost:80 serveo.net"
    echo ""
    echo "2. localhost.run:"
    echo "   ssh -R 80:localhost:80 localhost.run"
    echo ""
    echo "3. LocalTunnel:"
    echo "   npx localtunnel --port 80"
    echo ""
    echo "💡 Tente uma das opções acima manualmente."
    echo "   Depois use a URL gerada para configurar o webhook no GitHub."
fi