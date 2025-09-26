# Git Board - Dashboard GitHub Webhooks

Sistema simples para receber e visualizar webhooks do GitHub em tempo real.

## 🚀 **Início Rápido**

### **Modo Local (desenvolvimento)**
```bash
# 1. Iniciar aplicação
make up

# 2. Descobrir URL do webhook
make webhook-url

# 3. Configurar no GitHub (veja seção abaixo)
# 4. Acessar dashboard: http://localhost:3000
```

### **Modo Público (acesso via internet)**
```bash
# 1. Iniciar com túnel público
make up-public

# 2. Aguardar URLs públicas aparecerem
# 3. Usar a URL do webhook que apareceu
# 4. Configurar no GitHub
```

## 📍 **URLs da Aplicação**

### **Modo Local**
- **Dashboard**: http://localhost:3000
- **API**: http://localhost:8000
- **Webhook**: Use `make webhook-url` para descobrir sua URL

### **Modo Público (túnel)**
- **Dashboard**: https://XXXXX.ngrok.io (ou outro túnel)
- **API**: https://XXXXX.ngrok.io/api
- **Webhook**: https://XXXXX.ngrok.io/index_json.php
- *(Execute `make up-public` para ver opções de túnel)*

## 🔗 **Configurar Webhook no GitHub**

### **1. Descobrir sua URL**
```bash
make webhook-url
# Resultado: http://192.168.1.100:8000/index_json.php
```

### **2. Configurar no GitHub**
1. Vá para seu repositório → **Settings** → **Webhooks** → **Add webhook**
2. **Payload URL**: `http://SEU_IP:8000/index_json.php` (use a URL do comando acima)
3. **Content type**: `application/json`
4. **Events**: Marque `push`, `pull_request`, `issues`
5. Clique **Add webhook**

### **3. Testar**
```bash
# Ver logs em tempo real
make logs-api

# Fazer push no repositório
git add . && git commit -m "Test" && git push

# Verificar no dashboard: http://localhost:3000
```

## 🛠️ **Comandos Úteis**

```bash
make up          # Iniciar aplicação (modo local)
make up-public   # Iniciar com túnel público (acesso via internet)
make down        # Parar aplicação
make logs        # Ver logs
make status      # Status dos containers
make webhook-url # Descobrir URL do webhook (modo local)
make build       # Reconstruir containers
make clean       # Limpar containers e volumes
make help        # Ver todos os comandos
```

## 🔧 **Solução de Problemas**

### **Erro de porta em uso**
```bash
# Parar processo na porta 8000
sudo lsof -ti:8000 | xargs kill -9
make up
```

### **Webhook não funciona**
```bash
# Verificar se API está rodando
make status

# Ver logs
make logs-api

# Testar endpoint
curl http://localhost:8000/api/timeline
```

### **Dashboard não carrega**
```bash
# Verificar logs do dashboard
make logs-dashboard

# Verificar se API responde
curl http://localhost:8000/api/repositories
```

## 📊 **O que o sistema faz**

- ✅ Recebe webhooks do GitHub (push, pull requests, issues)
- ✅ Mostra timeline de eventos em tempo real
- ✅ Exibe estatísticas por repositório e usuário
- ✅ Gráficos interativos de atividade
- ✅ Auto-refresh a cada 30 segundos
- ✅ Interface responsiva e moderna
- ✅ Armazenamento JSON (sem banco de dados)
- ✅ Túnel público gratuito (serveo.net)

## 🎯 **Exemplo Completo**

### **Modo Local**
```bash
# 1. Iniciar
make up

# 2. Descobrir URL
make webhook-url
# Anote a URL que aparece

# 3. Configurar no GitHub
# - Vá para Settings > Webhooks > Add webhook
# - Use a URL do passo 2
# - Content type: application/json
# - Events: push, pull_request, issues

# 4. Testar
make logs-api
# Em outro terminal: git push
# Acesse: http://localhost:3000
```

### **Modo Público (Recomendado)**
```bash
# 1. Iniciar serviços
make up-public

# 2. Escolher opção de túnel:
#    - ngrok (recomendado): ngrok http 80
#    - LocalTunnel: npx localtunnel --port 80
#    - serveo.net: ssh -R 80:localhost:80 serveo.net

# 3. Configurar no GitHub
# - Vá para Settings > Webhooks > Add webhook
# - Use a URL pública do túnel escolhido
# - Content type: application/json
# - Events: push, pull_request, issues

# 4. Testar
# Em outro terminal: git push
# Acesse a URL pública do túnel
```

**Pronto! Seu dashboard está funcionando! 🎉**
