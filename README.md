# Cardeneta - Sistema de Gerenciamento Financeiro Pessoal

![Cardeneta Logo](https://via.placeholder.com/150x50?text=Cardeneta)  
*Sua carteira digital para controle financeiro simplificado*

## 📋 Visão Geral

O Cardeneta é uma aplicação web moderna para gerenciamento financeiro pessoal, permitindo que os usuários controlem suas receitas, despesas e acompanhem seus gastos de forma intuitiva.

## ✨ Funcionalidades

- 💳 Cadastro e autenticação de usuários
- 📊 Dashboard com resumo financeiro
- 💰 Controle de receitas e despesas
- 🏦 Gerenciamento de múltiplas carteiras
- 📱 Interface responsiva e moderna
- 📊 Gráficos e relatórios
- 🔄 Sincronização em tempo real

## 🛠️ Tecnologias

### Frontend
- React 19 com TypeScript
- Vite como bundler
- React Router para navegação
- Tailwind CSS para estilização
- Radix UI e shadcn/ui para componentes
- React Hook Form para formulários
- React Query para gerenciamento de estado

### Backend
- Node.js com NestJS
- Prisma ORM
- SQLite (pode ser facilmente alterado para outros bancos)
- JWT para autenticação
- Swagger para documentação da API

## 🚀 Como Executar

### Pré-requisitos

- Docker e Docker Compose instalados
- Node.js 18+
- Yarn ou NPM

### Usando Docker (Recomendado)

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/cardeneta.git
   cd cardeneta
   ```

2. Inicie os containers:
   ```bash
   docker-compose up -d --build
   ```

3. Acesse a aplicação:
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:3030/api

### Desenvolvimento Local

#### Backend

```bash
cd backend
cp .env.example .env
yarn install
yarn start:dev
```

#### Frontend

```bash
cd frontend
yarn install
yarn dev
```

## 📦 Estrutura do Projeto

```
cardeneta/
├── backend/           # API em NestJS
│   ├── src/           # Código-fonte
│   ├── prisma/        # Configurações do Prisma
│   └── ...
├── frontend/          # Aplicação React
│   ├── public/        # Arquivos estáticos
│   ├── src/           # Código-fonte
│   └── ...
└── docker-compose.yml # Configuração do Docker
```

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Por favor, leia o [guia de contribuição](CONTRIBUTING.md) para saber como contribuir com o projeto.

## 📬 Contato

Seu Nome - [@seu_twitter](https://twitter.com/seu_twitter)  
Projeto: [https://github.com/seu-usuario/cardeneta](https://github.com/seu-usuario/cardeneta)
