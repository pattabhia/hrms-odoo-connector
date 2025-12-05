.PHONY: help install dev start test lint format docker-build docker-up docker-down docker-logs clean

# Default target
.DEFAULT_GOAL := help

# Colors for terminal output
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m # No Color

##@ General

help: ## Display this help message
	@echo "$(CYAN)HRMS Odoo Connector - Makefile Commands$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "Usage: make $(CYAN)<target>$(NC)\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(CYAN)%-15s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(YELLOW)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Development

install: ## Install dependencies
	@echo "$(GREEN)Installing dependencies...$(NC)"
	npm install
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

dev: ## Run application in development mode
	@echo "$(GREEN)Starting development server...$(NC)"
	npm run dev

start: ## Run application in production mode
	@echo "$(GREEN)Starting production server...$(NC)"
	npm start

##@ Testing

test: ## Run all tests
	@echo "$(GREEN)Running tests...$(NC)"
	npm test

test-watch: ## Run tests in watch mode
	@echo "$(GREEN)Running tests in watch mode...$(NC)"
	npm run test:watch

test-unit: ## Run unit tests only
	@echo "$(GREEN)Running unit tests...$(NC)"
	npm run test:unit

test-integration: ## Run integration tests only
	@echo "$(GREEN)Running integration tests...$(NC)"
	npm run test:integration

coverage: ## Generate test coverage report
	@echo "$(GREEN)Generating coverage report...$(NC)"
	npm test -- --coverage
	@echo "$(GREEN)✓ Coverage report generated in ./coverage$(NC)"

##@ Code Quality

lint: ## Run ESLint
	@echo "$(GREEN)Running ESLint...$(NC)"
	npm run lint

lint-fix: ## Run ESLint and fix issues
	@echo "$(GREEN)Running ESLint with auto-fix...$(NC)"
	npm run lint:fix

format: ## Format code with Prettier
	@echo "$(GREEN)Formatting code...$(NC)"
	npm run format

format-check: ## Check code formatting
	@echo "$(GREEN)Checking code formatting...$(NC)"
	npm run format:check

##@ Docker

docker-build: ## Build Docker image
	@echo "$(GREEN)Building Docker image...$(NC)"
	docker build -t hrms-odoo-connector .
	@echo "$(GREEN)✓ Docker image built$(NC)"

docker-up: ## Start all Docker containers
	@echo "$(GREEN)Starting Docker containers...$(NC)"
	docker compose up -d
	@echo "$(GREEN)✓ Docker containers started$(NC)"
	@echo "$(YELLOW)API:   http://localhost:3000$(NC)"
	@echo "$(YELLOW)Odoo:  http://localhost:8069$(NC)"
	@echo "$(YELLOW)Docs:  http://localhost:3000/api-docs$(NC)"

docker-down: ## Stop all Docker containers
	@echo "$(GREEN)Stopping Docker containers...$(NC)"
	docker compose down
	@echo "$(GREEN)✓ Docker containers stopped$(NC)"

docker-down-volumes: ## Stop containers and remove volumes
	@echo "$(GREEN)Stopping Docker containers and removing volumes...$(NC)"
	docker compose down -v
	@echo "$(GREEN)✓ Docker containers and volumes removed$(NC)"

docker-logs: ## View Docker container logs
	@echo "$(GREEN)Viewing Docker logs...$(NC)"
	docker compose logs -f

docker-restart: docker-down docker-up ## Restart Docker containers

docker-ps: ## Show running Docker containers
	@echo "$(GREEN)Running containers:$(NC)"
	docker compose ps

##@ Database

db-seed: ## Seed database with sample data (implement as needed)
	@echo "$(YELLOW)Database seeding not implemented yet$(NC)"

db-migrate: ## Run database migrations (if using local DB)
	@echo "$(YELLOW)Database migrations not implemented yet$(NC)"

##@ Environment

env-setup: ## Create .env file from .env.example
	@if [ ! -f .env ]; then \
		echo "$(GREEN)Creating .env file...$(NC)"; \
		cp .env.example .env; \
		echo "$(GREEN)✓ .env file created. Please update with your configuration.$(NC)"; \
	else \
		echo "$(YELLOW).env file already exists$(NC)"; \
	fi

##@ Cleanup

clean: ## Remove node_modules and build artifacts
	@echo "$(GREEN)Cleaning up...$(NC)"
	rm -rf node_modules coverage logs/*.log
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

clean-all: clean docker-down-volumes ## Remove everything including Docker volumes
	@echo "$(GREEN)✓ Complete cleanup done$(NC)"

##@ Utilities

logs: ## View application logs
	@echo "$(GREEN)Viewing logs...$(NC)"
	tail -f logs/combined.log

logs-error: ## View error logs
	@echo "$(GREEN)Viewing error logs...$(NC)"
	tail -f logs/error.log

check-health: ## Check API health
	@echo "$(GREEN)Checking API health...$(NC)"
	@curl -s http://localhost:3000/health | json_pp || echo "$(YELLOW)API is not running$(NC)"

##@ Production

prod-build: lint test docker-build ## Run checks and build for production
	@echo "$(GREEN)✓ Production build complete$(NC)"

prod-deploy: ## Deploy to production (customize as needed)
	@echo "$(YELLOW)Production deployment not configured$(NC)"
