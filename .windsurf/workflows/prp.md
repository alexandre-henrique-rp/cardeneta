---
description: gerador de PRP
---

# PRP: Desenvolvimento de Funcionalidades para o Projeto Windsurf

Este documento (Product Requirement Prompt - PRP) fornece todas as informações necessárias para que um agente de IA desenvolva, implemente e valide uma nova funcionalidade no projeto Windsurf. O objetivo é garantir a entrega de código de qualidade e pronto para produção na primeira tentativa.

## 1. Goal (O Quê?)

*Descreva de forma clara e concisa o que precisa ser construído. Qual é o resultado final esperado?*

**Exemplo:**
> Implementar um novo módulo de registo de sessões de windsurf que permita aos utilizadores guardar detalhes das suas atividades, como localização, condições do vento, equipamento utilizado e duração.

**Preencha aqui o seu objetivo:**
>

---

## 2. Why (Porquê?)

*Explique o valor de negócio e o impacto para o utilizador. Porque é que esta funcionalidade é importante? Que problema resolve ou que oportunidade aproveita?*

**Exemplo:**
> **Valor de Negócio:** Aumentar o envolvimento e a retenção de utilizadores, permitindo-lhes acompanhar o seu progresso e partilhar as suas conquistas. Os dados recolhidos podem ser usados futuramente para oferecer recomendações personalizadas.
> **Impacto para o Utilizador:** Oferece uma ferramenta centralizada para que os praticantes de windsurf possam analisar o seu desempenho, entender quais as condições e equipamentos que funcionam melhor, e manter um histórico das suas melhores sessões.

**Preencha aqui a justificação:**
> **Valor de Negócio:**
>
> **Impacto para o Utilizador:**
>

---

## 3. Context (Onde e Como?)

*Esta é a secção mais crítica. Forneça todo o contexto técnico necessário para a IA. Seja preciso e detalhado.*

### 3.1. Estrutura de Ficheiros e Código Relevante
*Indique os caminhos exatos dos ficheiros e diretórios que a IA precisa de conhecer, modificar ou criar. Inclua trechos de código (snippets) relevantes que a IA deva usar como referência.*

**Exemplo:**
> **Ficheiros a modificar:**
> * `src/components/Dashboard.js`: Adicionar um novo botão "Registar Sessão".
> * `src/routes/api.js`: Criar um novo endpoint `/api/sessions`.
>
> **Ficheiros a criar:**
> * `src/components/SessionLogger.js`: Novo componente React para o formulário de registo.
> * `src/models/Session.js`: Novo modelo de dados para a base de dados.
>
> **Snippet de referência (exemplo de um modelo existente):**
> ```javascript
> // src/models/User.js
> const mongoose = require('mongoose');
> const userSchema = new mongoose.Schema({
>   name: String,
>   email: { type: String, unique: true },
> });
> module.exports = mongoose.model('User', userSchema);
> ```

**Preencha aqui o contexto de ficheiros:**
> **Ficheiros a modificar:**
> *
>
> **Ficheiros a criar:**
> *
>
> **Snippets de referência:**
> ```[linguagem]
> // cole o seu código de referência aqui
> ```

### 3.2. Bibliotecas, Frameworks e Versões
*Liste todas as bibliotecas, frameworks e dependências importantes, incluindo as suas versões. Mencione também padrões de código ou "gotchas" (armadilhas) específicos do projeto.*

**Exemplo:**
> * `react`: v18.2.0
> * `mongoose`: v7.5.0
> * `express`: v4.18.2
> * **Gotcha:** O nosso linter não permite o uso de `var`. Use sempre `let` ou `const`. Todas as chamadas de API devem ter tratamento de erros com `try...catch`.

**Preencha aqui o contexto de dependências:**
> *
> *
> *
> **Gotchas e Padrões:**
> *

### 3.3. Documentação Externa e APIs
*Forneça links para documentação de APIs externas ou bibliotecas que serão utilizadas.*

**Exemplo:**
> * Para obter dados de meteorologia, vamos usar a API Open-Meteo. A documentação está em: [https://open-meteo.com/en/docs](https://open-meteo.com/en/docs)
> * O endpoint a ser usado é o de previsão com os parâmetros: `latitude`, `longitude`, `hourly=windspeed_10m,winddirection_10m`.

**Preencha aqui a documentação externa:**
> *

---

## 4. Implementation Blueprint (Plano de Ação)

*Divida a tarefa em passos lógicos e sequenciais. Pode usar pseudocódigo para detalhar a lógica que deve ser implementada.*

**Exemplo:**
> **Tarefa 1: Backend - API e Modelo de Dados**
> 1.  Em `src/models/`, criar o ficheiro `Session.js`.
> 2.  Definir o Schema no Mongoose com os seguintes campos: `userId` (ObjectId), `date` (Date), `location` (String), `windSpeed` (Number), `windDirection` (String), `duration` (Number), `equipment` (String), `notes` (String).
> 3.  Em `src/routes/api.js`, criar um endpoint `POST /api/sessions`.
> 4.  A rota deve receber os dados do corpo do pedido (request body), criar uma nova instância do modelo `Session` e guardá-la na base de dados.
> 5.  Retornar a sessão criada com o status 201.
>
> **Tarefa 2: Frontend - Formulário de Registo**
> 1.  Criar o componente `src/components/SessionLogger.js`.
> 2.  O formulário deve conter campos para todos os dados do modelo `Session`.
> 3.  Ao submeter o formulário, fazer uma chamada `POST` para o endpoint `/api/sessions` com os dados.
> 4.  Após o sucesso, redirecionar o utilizador para o Dashboard e mostrar uma mensagem de confirmação.
>
> **Pseudocódigo para o componente React:**
> ```javascript
> function SessionLogger() {
>   // usar useState para gerir o estado de cada campo do formulário
>   const [location, setLocation] = useState('');
>
>   // função handleSubmit
>   async function handleSubmit(event) {
>     event.preventDefault();
>     // construir o objeto de dados
>     const sessionData = { location, ... };
>     // fazer a chamada fetch para POST /api/sessions
>     // tratar a resposta
>   }
>
>   // retornar o JSX com a estrutura do formulário
>   return <form onSubmit={handleSubmit}>...</form>;
> }
> ```

**Preencha aqui o seu plano de ação:**
> **Tarefa 1:**
> 1.
> 2.
>
> **Tarefa 2:**
> 1.
> 2.
>
> **Pseudocódigo:**
> ```[linguagem]
> // cole o seu pseudocódigo aqui
> ```

---

## 5. Validation Loop (Como Validar?)

*Forneça comandos, testes ou passos manuais que a IA (ou um humano) possa executar para verificar que a funcionalidade foi implementada corretamente. O ideal são testes automatizados.*

**Exemplo:**
> **Testes Automatizados:**
> 1.  Executar o comando `npm test -- --testPathPattern=tests/api/sessions.test.js` para validar a API.
> 2.  O teste deve verificar se um POST para `/api/sessions` com dados válidos retorna 201 e se os dados são guardados corretamente na base de dados.
>
> **Validação Manual:**
> 1.  Inicie a aplicação com `npm start`.
> 2.  Aceda a `http://localhost:3000/dashboard`.
> 3.  Clique em "Registar Sessão".
> 4.  Preencha todos os campos do formulário e submeta.
> 5.  Verifique se a aplicação redireciona para o dashboard e se uma mensagem de sucesso é exibida.
> 6.  Confirme na base de dados (coleção `sessions`) que o novo registo foi criado com os dados corretos.

**Preencha aqui os passos de validação:**
> **Testes Automatizados:**
> 1.
>
> **Validação Manual:**
> 1.
> 2.

---
### **Checklist de Boas Práticas para este PRP:**

-   [ ] **Contexto é Rei:** Verificou se incluiu TODOS os ficheiros, snippets de código, e documentação necessários?
-   [ ] **Validação Clara:** Os passos de validação são executáveis e cobrem os cenários de sucesso?
-   [ ] **Denso em Informação:** Usou palavras-chave e padrões consistentes com o resto do seu projeto?
-   [ ] **Sucesso Progressivo:** A tarefa está dividida em passos lógicos e incrementais?