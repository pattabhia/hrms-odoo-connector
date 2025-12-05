# HRMS Odoo Connector

> Enterprise-grade HRMS connector for Odoo following SOLID principles and best practices

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)

A production-ready REST API connector for Odoo HRMS built with Node.js and Express, featuring connection pooling, caching, comprehensive error handling, and Swagger documentation.

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Docker](#-docker)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [License](#-license)

## ✨ Features

- **SOLID Principles**: Clean architecture following all SOLID principles
- **Repository Pattern**: Data access abstraction for maintainability
- **Connection Pooling**: Efficient Odoo connection management
- **Redis Caching**: Optional caching layer for improved performance
- **Swagger Documentation**: Interactive API documentation
- **Error Handling**: Comprehensive error handling with custom error classes
- **Request Validation**: Input validation using Joi
- **Rate Limiting**: API rate limiting to prevent abuse
- **Logging**: Structured logging with Winston
- **Docker Support**: Full Docker and Docker Compose support
- **Testing**: Unit and integration tests with Jest
- **Security**: Helmet.js, CORS, JWT authentication ready
- **Code Quality**: ESLint and Prettier configuration

## 🏗️ Architecture

This project follows a layered architecture with SOLID principles:

```
┌─────────────────────────────────────┐
│         Controllers (HTTP)          │ ← Handle HTTP requests/responses
├─────────────────────────────────────┤
│      Services (Business Logic)      │ ← Business logic & orchestration
├─────────────────────────────────────┤
│    Repositories (Data Access)       │ ← Data access & Odoo communication
├─────────────────────────────────────┤
│     Infrastructure (Odoo Client)    │ ← Odoo connection & pooling
└─────────────────────────────────────┘
```

**Key Design Patterns:**
- **Repository Pattern**: Abstracts data access layer
- **Dependency Injection**: Loose coupling between components
- **Adapter Pattern**: Transforms data between Odoo and internal formats
- **Factory Pattern**: Creates model-specific handlers
- **Singleton Pattern**: Connection pool management

## 📦 Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Odoo** >= 14.0 (tested with 16.0)
- **Redis** (optional, for caching)
- **Docker** & **Docker Compose** (optional)

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourrepo/hrms-odoo-connector.git
cd hrms-odoo-connector

# Create environment file
make env-setup

# Start all services (Odoo, PostgreSQL, Redis, API)
make docker-up
```

The API will be available at:
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api-docs
- **Odoo**: http://localhost:8069
- **Health Check**: http://localhost:3000/health

### Manual Setup

```bash
# Install dependencies
make install

# Configure environment
make env-setup
# Edit .env with your Odoo credentials

# Start in development mode
make dev
```

## ⚙️ Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure. Two Odoo connection profiles are available so you can easily switch between your hosted web instance and the local Docker stack:

```env
# Application
NODE_ENV=development
PORT=3000

# Odoo profile (web | docker)
ODOO_PROFILE=web

# Web/remote instance
ODOO_WEB_HOST=your-web-host
ODOO_WEB_PORT=8069
ODOO_WEB_USERNAME=admin
ODOO_WEB_PASSWORD=secret

# Local Docker instance
ODOO_DOCKER_HOST=odoo
ODOO_DOCKER_PORT=8069
ODOO_DOCKER_USERNAME=admin
ODOO_DOCKER_PASSWORD=admin
```

- Set `ODOO_PROFILE=web` to point the API at your existing hosted Odoo instance using the `ODOO_WEB_*` variables.
- Set `ODOO_PROFILE=docker` (the default in `docker-compose.yml`) to connect to the local containers.

See `.env.example` for all available options.

## 📖 Usage

### API Examples

```bash
# Get all employees (paginated)
curl http://localhost:3000/api/v1/employees?page=1&limit=50

# Get employee by ID
curl http://localhost:3000/api/v1/employees/1

# Search employees
curl http://localhost:3000/api/v1/employees/search?name=John

# Create employee
curl -X POST http://localhost:3000/api/v1/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "departmentId": 1,
    "jobId": 5
  }'

# Update employee
curl -X PUT http://localhost:3000/api/v1/employees/1 \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890"}'

# Delete employee
curl -X DELETE http://localhost:3000/api/v1/employees/1
```

## 📚 API Documentation

### Swagger UI

Interactive API documentation: **http://localhost:3000/api-docs**

### Endpoints Overview

#### Employee Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/employees` | List all employees (paginated) |
| GET | `/api/v1/employees/:id` | Get employee by ID |
| GET | `/api/v1/employees/active` | Get active employees |
| GET | `/api/v1/employees/department/:id` | Get by department |
| GET | `/api/v1/employees/manager/:id` | Get by manager |
| GET | `/api/v1/employees/job/:id` | Get by job title |
| GET | `/api/v1/employees/search?name=xxx` | Search by name |
| POST | `/api/v1/employees` | Create new employee |
| PUT | `/api/v1/employees/:id` | Update employee |
| PATCH | `/api/v1/employees/:id` | Partial update |
| DELETE | `/api/v1/employees/:id` | Delete employee |
| POST | `/api/v1/employees/:id/deactivate` | Deactivate employee |
| POST | `/api/v1/employees/:id/reactivate` | Reactivate employee |

#### Attendance Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/attendance` | List attendance entries |
| GET | `/api/v1/attendance/:id` | Get attendance entry |
| POST | `/api/v1/attendance` | Create attendance entry |
| PUT/PATCH | `/api/v1/attendance/:id` | Update attendance entry |
| DELETE | `/api/v1/attendance/:id` | Delete attendance entry |

#### Time Off Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/timeoff` | List leave requests |
| GET | `/api/v1/timeoff/:id` | Get leave request |
| POST | `/api/v1/timeoff` | Create leave request |
| PUT/PATCH | `/api/v1/timeoff/:id` | Update leave request |
| DELETE | `/api/v1/timeoff/:id` | Delete leave request |

#### Payroll Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/payroll` | List payslips |
| GET | `/api/v1/payroll/:id` | Get payslip |
| POST | `/api/v1/payroll` | Create payslip shell |
| PUT/PATCH | `/api/v1/payroll/:id` | Update payslip |
| DELETE | `/api/v1/payroll/:id` | Delete payslip |

#### Expenses Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/expenses` | List expenses |
| GET | `/api/v1/expenses/:id` | Get expense |
| POST | `/api/v1/expenses` | Create expense |
| PUT/PATCH | `/api/v1/expenses/:id` | Update expense |
| DELETE | `/api/v1/expenses/:id` | Delete expense |

#### Invoices Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/invoices` | List invoices |
| GET | `/api/v1/invoices/:id` | Get invoice |
| POST | `/api/v1/invoices` | Create invoice |
| PUT/PATCH | `/api/v1/invoices/:id` | Update invoice |
| DELETE | `/api/v1/invoices/:id` | Delete invoice |

#### Recruitment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/recruitment` | List applicants |
| GET | `/api/v1/recruitment/:id` | Get applicant |
| POST | `/api/v1/recruitment` | Create applicant |
| PUT/PATCH | `/api/v1/recruitment/:id` | Update applicant |
| DELETE | `/api/v1/recruitment/:id` | Delete applicant |

## 🧪 Testing

```bash
# Run all tests
make test

# Run with coverage
make coverage

# Run unit tests
make test-unit

# Run in watch mode
make test-watch
```

Current test coverage target: **70%+**

## 🐳 Docker

### Quick Commands

```bash
make docker-up          # Start all services
make docker-down        # Stop services
make docker-logs        # View logs
make docker-restart     # Restart services
make docker-ps          # Show running containers
```

### Services

The Docker Compose setup includes:
- **API**: HRMS Connector (port 3000)
- **Odoo**: Odoo 16.0 (port 8069)
- **PostgreSQL**: Database for Odoo (port 5432)
- **Redis**: Cache (port 6379)

## 📁 Project Structure

```
hrms-odoo-connector/
├── src/
│   ├── config/              # Configuration management
│   ├── core/
│   │   ├── base/            # Base classes (Repository, Service, Controller)
│   │   ├── interfaces/      # Interface definitions
│   │   └── errors/          # Custom error classes
│   ├── modules/
│   │   └── employee/        # Employee module (full CRUD)
│   ├── infrastructure/
│   │   ├── odoo/           # Odoo client, connection pool, factory
│   │   ├── cache/          # Redis cache management
│   │   └── logging/        # Winston logger wrapper
│   ├── middleware/         # Express middleware
│   ├── utils/              # Helper functions
│   ├── app.js              # Express app configuration
│   └── server.js           # Server entry point
├── tests/                  # Unit and integration tests
├── docs/                   # Additional documentation
├── Dockerfile
├── docker-compose.yml
├── Makefile               # Development commands
└── package.json
```

## 👨‍💻 Development

### Code Quality

```bash
make lint              # Run ESLint
make lint-fix          # Fix linting issues
make format            # Format with Prettier
make format-check      # Check formatting
```

### Available Make Commands

Run `make help` to see all available commands.

### Adding New Modules

1. Create module structure in `src/modules/your-module/`
2. Implement: model, repository, service, controller, validator, adapter, routes
3. Register routes in `src/app.js`
4. Add tests in `tests/unit/` and `tests/integration/`

Example module structure:
```
src/modules/attendance/
├── attendance.model.js
├── attendance.repository.js
├── attendance.service.js
├── attendance.controller.js
├── attendance.validator.js
├── attendance.adapter.js
└── attendance.routes.js
```

## 📝 Additional Documentation

- **[API Documentation](docs/API.md)** - Complete API reference
- **[Architecture Guide](docs/ARCHITECTURE.md)** - Design patterns and principles
- **[Odoo Setup Guide](docs/ODOO_SETUP.md)** - Odoo configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build process or tooling changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/) - Web framework
- [odoo-xmlrpc](https://github.com/OCA/odoo-xmlrpc) - Odoo integration
- [Swagger UI Express](https://github.com/scottie1984/swagger-ui-express) - API documentation
- [Winston](https://github.com/winstonjs/winston) - Logging
- [Joi](https://github.com/sideway/joi) - Validation

---

**Built with ❤️ following SOLID principles and enterprise best practices**
