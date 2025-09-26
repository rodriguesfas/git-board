# Git Board - Makefile
# Comandos para gerenciar a aplicação com Docker e Composer

.PHONY: help up down build rebuild logs shell api-shell dashboard-shell install clean test setup status restart

# Cores para output
GREEN=\033[0;32m
YELLOW=\033[1;33m
RED=\033[0;31m
NC=\033[0m # No Color

# Variáveis
COMPOSE_FILE=docker-compose.yml
API_CONTAINER=git-board-api
DASHBOARD_CONTAINER=git-board-dashboard
NGINX_CONTAINER=git-board-nginx

# Comando padrão
help: ## Mostra esta ajuda
	@echo "$(GREEN)Git Board - Comandos Disponíveis:$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)Exemplos de uso:$(NC)"
	@echo "  make up          # Iniciar todos os serviços"
	@echo "  make down        # Parar todos os serviços"
	@echo "  make logs        # Ver logs de todos os serviços"
	@echo "  make shell       # Acessar shell do container da API"

# Docker Compose
up: ## Iniciar todos os serviços
	@echo "$(GREEN)🚀 Iniciando Git Board...$(NC)"
	docker-compose -f $(COMPOSE_FILE) up -d
	@echo "$(GREEN)✅ Serviços iniciados!$(NC)"
	@echo "$(YELLOW)📊 Dashboard: http://localhost:3000$(NC)"
	@echo "$(YELLOW)🔌 API: http://localhost:8000$(NC)"
	@echo "$(YELLOW)🌐 Nginx: http://localhost$(NC)"

down: ## Parar todos os serviços
	@echo "$(RED)🛑 Parando Git Board...$(NC)"
	docker-compose -f $(COMPOSE_FILE) down
	@echo "$(GREEN)✅ Serviços parados!$(NC)"

restart: ## Reiniciar todos os serviços
	@echo "$(YELLOW)🔄 Reiniciando Git Board...$(NC)"
	docker-compose -f $(COMPOSE_FILE) restart
	@echo "$(GREEN)✅ Serviços reiniciados!$(NC)"

build: ## Construir imagens Docker
	@echo "$(GREEN)🔨 Construindo imagens Docker...$(NC)"
	docker-compose -f $(COMPOSE_FILE) build
	@echo "$(GREEN)✅ Imagens construídas!$(NC)"

rebuild: ## Reconstruir imagens Docker (sem cache)
	@echo "$(GREEN)🔨 Reconstruindo imagens Docker...$(NC)"
	docker-compose -f $(COMPOSE_FILE) build --no-cache
	@echo "$(GREEN)✅ Imagens reconstruídas!$(NC)"

# Logs
logs: ## Ver logs de todos os serviços
	docker-compose -f $(COMPOSE_FILE) logs -f

logs-api: ## Ver logs apenas da API
	docker-compose -f $(COMPOSE_FILE) logs -f api

logs-dashboard: ## Ver logs apenas do Dashboard
	docker-compose -f $(COMPOSE_FILE) logs -f dashboard

logs-nginx: ## Ver logs apenas do Nginx
	docker-compose -f $(COMPOSE_FILE) logs -f nginx

# Shell access
shell: ## Acessar shell do container da API
	docker exec -it $(API_CONTAINER) /bin/bash

api-shell: shell ## Alias para shell da API

dashboard-shell: ## Acessar shell do container do Dashboard
	docker exec -it $(DASHBOARD_CONTAINER) /bin/sh

nginx-shell: ## Acessar shell do container do Nginx
	docker exec -it $(NGINX_CONTAINER) /bin/sh

# Instalação e setup
install: ## Instalar dependências
	@echo "$(GREEN)📦 Instalando dependências...$(NC)"
	@if [ -f composer.json ]; then composer install; fi
	@echo "$(GREEN)✅ Instalação concluída!$(NC)"

# Desenvolvimento
dev: ## Iniciar em modo desenvolvimento (com logs)
	@echo "$(GREEN)🛠️ Iniciando em modo desenvolvimento...$(NC)"
	docker-compose -f $(COMPOSE_FILE) up

dev-build: ## Construir e iniciar em modo desenvolvimento
	@echo "$(GREEN)🛠️ Construindo e iniciando em modo desenvolvimento...$(NC)"
	docker-compose -f $(COMPOSE_FILE) up --build

# Testes
test: ## Executar testes
	@echo "$(GREEN)🧪 Executando testes...$(NC)"
	docker exec $(API_CONTAINER) php /var/www/html/vendor/bin/phpunit || echo "$(YELLOW)⚠️ Testes não configurados ainda.$(NC)"

# Limpeza
clean: ## Limpar containers, volumes e imagens
	@echo "$(RED)🧹 Limpando containers e volumes...$(NC)"
	docker-compose -f $(COMPOSE_FILE) down -v --remove-orphans
	docker system prune -f
	@echo "$(GREEN)✅ Limpeza concluída!$(NC)"

clean-all: ## Limpeza completa (incluindo imagens)
	@echo "$(RED)🧹 Limpeza completa...$(NC)"
	docker-compose -f $(COMPOSE_FILE) down -v --remove-orphans --rmi all
	docker system prune -af
	@echo "$(GREEN)✅ Limpeza completa concluída!$(NC)"

# Status e informações
status: ## Mostrar status dos containers
	@echo "$(GREEN)📊 Status dos containers:$(NC)"
	docker-compose -f $(COMPOSE_FILE) ps

info: ## Mostrar informações da aplicação
	@echo "$(GREEN)📋 Informações do Git Board:$(NC)"
	@echo ""
	@echo "$(YELLOW)🌐 URLs:$(NC)"
	@echo "  Dashboard: http://localhost:3000"
	@echo "  API:       http://localhost:8000"
	@echo "  Nginx:     http://localhost"
	@echo ""
	@echo "$(YELLOW)🔌 Webhook GitHub:$(NC)"
	@echo "  URL: http://localhost:8000/index_json.php"
	@echo "  Content-Type: application/json"
	@echo ""
	@echo "$(YELLOW)📁 Volumes:$(NC)"
	@echo "  API Data: ./api/data/"
	@echo "  Dashboard: ./dashboard/"
	@echo ""

# Backup e restore
backup: ## Fazer backup dos dados
	@echo "$(GREEN)💾 Fazendo backup dos dados...$(NC)"
	@mkdir -p backups
	@tar -czf backups/git-board-$(shell date +%Y%m%d-%H%M%S).tar.gz api/data/
	@echo "$(GREEN)✅ Backup criado em backups/$(NC)"

restore: ## Restaurar backup (especificar BACKUP=arquivo.tar.gz)
	@if [ -z "$(BACKUP)" ]; then \
		echo "$(RED)❌ Especifique o arquivo de backup: make restore BACKUP=arquivo.tar.gz$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)📥 Restaurando backup $(BACKUP)...$(NC)"
	@tar -xzf $(BACKUP) -C ./
	@echo "$(GREEN)✅ Backup restaurado!$(NC)"

# Monitoramento
monitor: ## Monitorar recursos dos containers
	@echo "$(GREEN)📊 Monitorando recursos...$(NC)"
	docker stats $(API_CONTAINER) $(DASHBOARD_CONTAINER) $(NGINX_CONTAINER)

# Atualização
update: ## Atualizar dependências
	@echo "$(GREEN)🔄 Atualizando dependências...$(NC)"
	@if [ -f composer.json ]; then composer update; fi
	@echo "$(GREEN)✅ Dependências atualizadas!$(NC)"

# Comandos específicos por serviço
api-logs: logs-api ## Alias para logs da API
dashboard-logs: logs-dashboard ## Alias para logs do Dashboard
nginx-logs: logs-nginx ## Alias para logs do Nginx

# Webhook
webhook-url: ## Mostrar URLs para configurar webhook no GitHub
	@echo "$(GREEN)🔍 URLs para webhook GitHub:$(NC)"
	@echo ""
	@LOCAL_IP=$$(ip route get 1.1.1.1 | awk '{print $$7; exit}' 2>/dev/null || hostname -I | awk '{print $$1}'); \
	if [ -z "$$LOCAL_IP" ]; then \
		echo "$(RED)❌ Não foi possível descobrir o IP local$(NC)"; \
		echo "$(YELLOW)💡 Tente executar: ip addr show | grep inet$(NC)"; \
		exit 1; \
	fi; \
	echo "$(YELLOW)📡 IP Local: $$LOCAL_IP$(NC)"; \
	echo ""; \
	echo "$(YELLOW)🔗 URLs para webhook:$(NC)"; \
	echo "   Desenvolvimento: http://$$LOCAL_IP:8000/index_json.php"; \
	echo "   Produção: http://$$LOCAL_IP:8000/index.php"; \
	echo ""; \
	echo "$(YELLOW)📋 Configuração no GitHub:$(NC)"; \
	echo "   1. Settings > Webhooks > Add webhook"; \
	echo "   2. Use uma das URLs acima"; \
	echo "   3. Content type: application/json"; \
	echo "   4. Events: push, pull_request, issues, etc."


# Comandos de túnel público
up-public: ## Iniciar com túnel público (acesso via internet)
	@echo "$(GREEN)🌐 Iniciando Git Board com túnel público...$(NC)"
	@./simple-tunnel.sh

public: up-public ## Alias para up-public

tunnel-stop: ## Parar túnel público
	@if [ -f .tunnel.pid ]; then \
		TUNNEL_PID=$$(cat .tunnel.pid); \
		if kill -0 $$TUNNEL_PID 2>/dev/null; then \
			echo "$(RED)🛑 Parando túnel público...$(NC)"; \
			kill $$TUNNEL_PID; \
			rm -f .tunnel.pid; \
			echo "$(GREEN)✅ Túnel parado!$(NC)"; \
		else \
			echo "$(YELLOW)⚠️ Túnel já estava parado.$(NC)"; \
			rm -f .tunnel.pid; \
		fi; \
	else \
		echo "$(YELLOW)⚠️ Nenhum túnel ativo encontrado.$(NC)"; \
	fi
