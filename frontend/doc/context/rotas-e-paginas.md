# Rotas e Páginas

## Estrutura de Rotas

Baseado em TanStack Router com organização por funcionalidade.

### Rotas Públicas (`src/routes/_public/`)

#### `/login`
- **Arquivo**: `src/routes/_public/login/index.tsx`
- **Função**: Login de usuários
- **Componentes**: Formulário de login, recuperação de senha
- **Integrações**: Auth API, validação de formulário

#### `/cadastro`
- **Arquivo**: `src/routes/_public/cadastro/index.tsx`
- **Função**: Registro de novos usuários
- **Validações**: Email único, senha forte
- **Integrações**: API de registro, verificação de email

#### `/`
- **Arquivo**: `src/routes/_public/index.tsx`
- **Função**: Landing page
- **Redirecionamento**: Usuários logados vão para dashboard

### Rotas Privadas (`src/routes/(private)/`)

#### Dashboard (`/dashboard`)
- **Arquivo**: `src/routes/(private)/dashboard.tsx`
- **Função**: Painel principal com visão geral
- **Componentes**: Cards de resumo, gráficos, ações rápidas
- **Dados**: Total de contas, últimas transações, gráficos

#### Novo Registro (`/novo-registro`)
- **Arquivo**: `src/routes/(private)/_layout/novo-registro/index.tsx`
- **Função**: Formulário para novas transações
- **Integrações**: AtmForm component, API de transações

#### Conta Detalhada (`/conta/$id`)
- **Arquivo**: `src/routes/(private)/_layout/conta/$id/index.tsx`
- **Função**: Detalhes de uma conta específica
- **Componentes**: Lista de transações, gráficos por categoria
- **Funcionalidades**: Editar, excluir, filtrar transações

#### Configurações (`/configuracoes`)
- **Arquivo**: `src/routes/(private)/configuracoes/index.tsx`
- **Função**: Configurações do usuário
- **Funcionalidades**: Perfil, preferências, exportar dados

### Layouts

#### Layout Principal (`src/routes/(private)/_layout.tsx`)
- **Wrapper**: Para todas as rotas privadas
- **Componentes**: AppSidebar, Header
- **Estado**: Gerencia estado de navegação

#### Layout de Autenticação (`src/routes/_public/_layout.tsx`)
- **Wrapper**: Para rotas públicas
- **Estado**: Verifica autenticação, redireciona se necessário

## Parâmetros de Rota

### Parâmetros Dinâmicos
- `$id`: ID da conta ou transação
- `$type`: Tipo de transação (receita/despesa)

### Search Params
- `filter`: Filtros de data, categoria, status
- `page`: Paginação
- `sort`: Ordenação de resultados

## Guards de Rota

### Autenticação Guard
- **Verificação**: Valida token JWT
- **Redirecionamento**: Para login se não autenticado
- **Refresh**: Atualiza token automaticamente

### Autorização Guard
- **Verificação**: Permissões baseadas em roles
- **Contexto**: User role, subscription status
