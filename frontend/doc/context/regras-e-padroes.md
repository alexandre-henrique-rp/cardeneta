# Regras e Padrões do Projeto

## Princípios Fundamentais

### Clean Code
- **Nomes Significativos**: Variáveis e funções com nomes autoexplicativos
- **Funções Pequenas**: Máximo 20 linhas por função
- **Uma Responsabilidade**: Cada função tem um único propósito
- **Comentários**: Apenas quando necessário, explicando o "porquê"
- **Tratamento de Erros**: Erros explícitos e tratamento consistente

### SOLID
- **Single Responsibility**: Cada classe/componente tem uma única responsabilidade
- **Open/Closed**: Aberto para extensão, fechado para modificação
- **Liskov Substitution**: Subtipos devem ser substituíveis por tipos base
- **Interface Segregation**: Interfaces específicas e coesas
- **Dependency Inversion**: Depender de abstrações, não de implementações

### Domain-Driven Design (DDD)
- **Entidades**: Representam conceitos centrais do negócio
- **Value Objects**: Objetos sem identidade, definidos por valor
- **Repositórios**: Abstração para persistência de dados
- **Serviços de Domínio**: Lógica de negócio que não pertence a uma entidade
- **Fábricas**: Criação de objetos complexos

## Padrões de Arquitetura

### Clean Architecture
```
Presentation Layer (UI)
    ↓
Application Layer (Use Cases)
    ↓
Domain Layer (Business Logic)
    ↓
Infrastructure Layer (External Services)
```

### Padrões de Código

#### Componentes React
```typescript
// Exemplo de componente seguindo padrões
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size: 'sm' | 'md' | 'lg';
  onClick: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  children 
}) => {
  return (
    <button 
      className={cn(buttonVariants({ variant, size }))}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

#### Serviços
```typescript
// Exemplo de serviço seguindo DDD
interface UserRepository {
  findById(id: string): Promise<User>;
  save(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
}

class UserService {
  constructor(private userRepository: UserRepository) {}

  async registerUser(email: string, password: string): Promise<User> {
    // Validação de negócio
    if (await this.userRepository.findByEmail(email)) {
      throw new Error('Email já cadastrado');
    }
    
    const user = new User(email, password);
    await this.userRepository.save(user);
    return user;
  }
}
```

### Nomenclatura
- **Variáveis**: camelCase (ex: `userName`, `totalValue`)
- **Funções**: camelCase com verbo (ex: `calculateTotal`, `validateUser`)
- **Componentes**: PascalCase (ex: `UserProfile`, `DashboardCard`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `MAX_FILE_SIZE`, `API_BASE_URL`)
- **Arquivos**: kebab-case (ex: `user-profile.tsx`, `api-service.ts`)

### Testes
- **Unitários**: Jest + React Testing Library
- **Integração**: Testes de API com MSW (Mock Service Worker)
- **E2E**: Playwright para testes de ponta a ponta
- **TDD**: Desenvolvimento orientado a testes quando possível

### Commits
- **Formato**: Conventional Commits
- **Exemplos**:
  - `feat: add biometric authentication`
  - `fix: resolve currency input validation`
  - `docs: update API documentation`
  - `refactor: improve component structure`
