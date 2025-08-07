# Componentes Principais

## Componentes de Navegação

### AppSidebar (`src/components/app-sidebar.tsx`)
- **Função**: Navegação lateral principal
- **Estado**: Gerencia estado de abertura/fechamento
- **Integração**: TanStack Router para navegação
- **Responsivo**: Adapta-se a diferentes tamanhos de tela

### NavMain (`src/components/nav-main.tsx`)
- **Função**: Menu principal de navegação
- **Itens**: Dashboard, Novo Registro, Contas, Relatórios
- **Estado**: Indicação visual da rota ativa

## Componentes de Formulário

### AtmForm (`src/components/atm-form.tsx`)
- **Função**: Formulário para registro de transações
- **Modos**: Create/Edit
- **Validação**: Zod schema com React Hook Form
- **Campos**: Nome, valor, data, tipo, status, comprovante
- **Integrações**: Upload de arquivos, formatação de moeda

### CurrencyInput (`src/components/currency-input.tsx`)
- **Função**: Input para valores monetários
- **Formatação**: Máscara de moeda brasileira
- **Validação**: Apenas números válidos

## Componentes de UI

### DataTable (`src/components/data-table.tsx`)
- **Função**: Tabela de dados com paginação e filtros
- **Integração**: TanStack Table
- **Features**: Ordenação, busca, ações em linha

### Charts (`src/components/charts/`)
- **PieChart**: Gráfico de pizza para categorias
- **LineChart**: Gráfico de linha para evolução temporal
- **BarChart**: Gráfico de barras para comparações

## Componentes de Layout

### Layout Principal (`src/routes/(private)/_layout.tsx`)
- **Função**: Layout base para rotas protegidas
- **Integração**: Sidebar e conteúdo principal
- **Responsivo**: Adaptação mobile/desktop

### Layout Auth (`src/routes/_public/_layout.tsx`)
- **Função**: Layout para rotas públicas (login, cadastro)
- **Estado**: Gerencia estado de autenticação
- **Redirecionamento**: Auto-redirecionamento para usuários logados

## Componentes de Estado

### AuthProvider (`src/context/auth-context.tsx`)
- **Função**: Gerenciamento global de autenticação
- **Integrações**: API de autenticação, armazenamento local
- **Features**: Login, logout, refresh token, persistência

### ThemeProvider (`src/context/theme-context.tsx`)
- **Função**: Gerenciamento de tema (claro/escuro)
- **Persistência**: Salva preferência no localStorage
- **Integração**: Shadcn UI theme system
