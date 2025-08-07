# Tecnologias e Arquitetura

## Stack Tecnológica

### Frontend
- **Framework**: React 18 com TypeScript
- **Router**: TanStack Router (ex-React Router)
- **Estado**: React Query (TanStack Query)
- **UI**: Shadcn UI + Tailwind CSS
- **Build**: Vite
- **PWA**: Vite PWA Plugin
- **Validação**: Zod + React Hook Form
- **Ícones**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma
- **Banco**: PostgreSQL
- **Autenticação**: JWT + WebAuthn (futuro)
- **Validação**: Zod

### Infraestrutura
- **Deploy**: Vercel (frontend), Railway (backend)
- **CDN**: Cloudflare
- **Analytics**: Vercel Analytics

## Arquitetura Clean

### Camadas
1. **Presentation Layer**: Componentes React, páginas, formulários
2. **Application Layer**: Hooks customizados, serviços
3. **Domain Layer**: Entidades, regras de negócio
4. **Infrastructure Layer**: APIs, banco de dados, serviços externos

### Padrões Implementados
- **Repository Pattern**: Para acesso a dados
- **Factory Pattern**: Para criação de instâncias
- **Strategy Pattern**: Para diferentes tipos de validação
- **Observer Pattern**: Para sincronização de estado

## Estrutura de Pastas

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (Shadcn)
│   ├── forms/          # Formulários específicos
│   └── charts/         # Componentes de gráficos
├── routes/             # Rotas do TanStack Router
│   ├── (private)/      # Rotas protegidas
│   └── _public/        # Rotas públicas
├── hooks/              # Hooks customizados
├── lib/                # Utilitários e configurações
├── services/           # Serviços de API
└── types/              # Definições de tipos TypeScript
```
