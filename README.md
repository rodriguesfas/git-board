# Git Board - Dashboard GitHub Webhooks

Sistema completo para receber, processar e visualizar webhooks do GitHub em tempo real com interface moderna e funcionalidades avançadas.

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
4. **Events**: Marque os eventos desejados:
   - ✅ `push` - Commits e pushes
   - ✅ `pull_request` - Pull requests
   - ✅ `issues` - Issues e comentários
   - ✅ `workflow_run` - GitHub Actions
   - ✅ `check_run` - Checks e testes
   - ✅ `check_suite` - Suites de verificação
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

## 🛠️ **Tecnologias Utilizadas**

### **Backend**
- **PHP 8.1+**: API RESTful para processamento de webhooks
- **JSON Storage**: Armazenamento de dados sem banco de dados
- **Docker**: Containerização da aplicação
- **Nginx**: Proxy reverso e servidor web

### **Frontend**
- **React 18**: Interface de usuário moderna
- **Tailwind CSS**: Estilização responsiva
- **Lucide React**: Ícones modernos
- **Axios**: Cliente HTTP para API

### **Infraestrutura**
- **Docker Compose**: Orquestração de containers
- **Nginx**: Balanceamento de carga
- **Túneis Públicos**: ngrok, localtunnel, serveo.net

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

# Verificar se containers estão rodando
make status
```

### **Atividade Temporal não mostra dados**
```bash
# Verificar se há eventos na API
curl http://localhost:8000/api/timeline?limit=5

# Verificar logs da API
make logs-api

# Recarregar página (F5) para forçar atualização
```

### **Notificações não funcionam**
```bash
# Verificar permissões do navegador
# - Chrome: Configurações > Privacidade > Notificações
# - Firefox: Configurações > Privacidade > Notificações

# Verificar se eventos estão chegando
make logs-api
```

### **Problemas com túnel público**
```bash
# Tentar outro serviço de túnel
make up-public
# Escolher ngrok se localtunnel não funcionar

# Verificar se porta 80 está livre
sudo lsof -i:80
```

## 📊 **Funcionalidades**

### **🎯 Core Features**
- ✅ **Webhooks GitHub**: Recebe push, pull requests, issues, workflows, checks
- ✅ **Timeline em Tempo Real**: Visualização cronológica de todos os eventos
- ✅ **Dashboard Interativo**: Interface moderna e responsiva
- ✅ **Auto-refresh**: Atualização automática a cada 30 segundos
- ✅ **Armazenamento JSON**: Sem necessidade de banco de dados

### **📈 Analytics & Visualizações**
- ✅ **Atividade Temporal**: Gráficos de atividade por hora/dia/mês
- ✅ **Estatísticas por Usuário**: Ranking de desenvolvedores mais ativos
- ✅ **Estatísticas por Evento**: Distribuição de tipos de eventos
- ✅ **Cards de Estatísticas**: Métricas resumidas e insights
- ✅ **Filtros Avançados**: Por repositório, tipo de evento, período

### **🔔 Sistema de Notificações**
- ✅ **Notificações do Navegador**: Alertas em tempo real
- ✅ **Detecção de Alta Atividade**: Alerta quando há muitos eventos
- ✅ **Cooldown Inteligente**: Evita spam de notificações
- ✅ **Configurações Personalizáveis**: Controle total sobre notificações

### **🛠️ Ferramentas & Utilitários**
- ✅ **Health Check**: Monitoramento do status dos serviços
- ✅ **Modo Compacto**: Interface otimizada para telas menores
- ✅ **Atalhos de Teclado**: Navegação rápida (F5, Ctrl+R, etc.)
- ✅ **Relatórios & Insights**: Análises automáticas de padrões
- ✅ **Seletor de Repositórios**: Visualização por repositório específico

### **🚀 Deploy & Acesso**
- ✅ **Docker Compose**: Deploy simples e rápido
- ✅ **Túnel Público**: Acesso via internet (ngrok, localtunnel, serveo)
- ✅ **Nginx**: Proxy reverso e balanceamento
- ✅ **API RESTful**: Endpoints para integração externa

## 🔌 **API Endpoints**

### **Timeline & Eventos**
```bash
GET /api/timeline?limit=50&repository_id=ID
GET /api/activity?hours=24&repository_id=ID
```

### **Estatísticas**
```bash
GET /api/stats?repository_id=ID
GET /api/user-stats?repository_id=ID&limit=10
GET /api/event-stats?repository_id=ID
```

### **Repositórios**
```bash
GET /api/repositories
DELETE /api/repositories/{id}
```

### **Webhook**
```bash
POST /index_json.php
# Recebe webhooks do GitHub
```

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

## ⌨️ **Atalhos de Teclado**

| Atalho | Ação |
|--------|------|
| `F5` | Atualizar dados |
| `Ctrl + R` | Atualizar dados |
| `Ctrl + ,` | Abrir configurações |
| `Ctrl + F` | Abrir filtros |
| `Ctrl + H` | Abrir ajuda |
| `Ctrl + M` | Alternar modo compacto |
| `Esc` | Fechar modais |

## 🎉 **Pronto!**

Seu dashboard está funcionando! Agora você pode:

- 📊 **Monitorar** atividade do GitHub em tempo real
- 🔔 **Receber** notificações de eventos importantes  
- 📈 **Analisar** padrões de desenvolvimento
- 🎯 **Filtrar** por repositório, usuário ou tipo de evento
- 📱 **Acessar** de qualquer dispositivo via túnel público

**Divirta-se monitorando seu código! 🚀**
