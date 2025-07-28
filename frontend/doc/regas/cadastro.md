# página de cadastro

## objetivo
criar uma página de cadastro que vai ter os seguintes campos:
- nome
- valor
- data
- categoria (receita `Credito` ou despesa `Debito`) => select
- data de vencimento (se for despesa) 
- tipo de pagamento (dinheiro, cartão, pix, boleto, transferência) => select
- upload de arquivos (pdf, jpg, png) => `npx shadcn@latest add https://originui.com/r/comp-545.json`

## regras
- o nome deve ter pelo menos 3 caracteres => obrigatório
- o valor deve ser maior que 0  deve ter uma máscara de moeda (R$) com 2 casas decimais (ex: R$ 1.000,00) => obrigatório
- a data deve usar o componente `npx shadcn@latest add https://originui.com/r/comp-41.json` => obrigatório
- a categoria deve ser select `npx shadcn@latest add select` => obrigatório
- a data de vencimento deve usar o componente `npx shadcn@latest add https://originui.com/r/comp-41.json`
- o tipo de pagamento deve ser select `npx shadcn@latest add select` => obrigatório
- o upload de arquivos que deve receber arquivos do tipo pdf, jpg, png utilizando o componente `npx shadcn@latest add https://originui.com/r/comp-545.json`

## Label

- Nome
- Valor
- Data 
- Categoria
- Data de vencimento
- Tipo de pagamento
- Comprovante

## Botão

- Salvar => salvar o formulário se der tudo certo retornar para home
- Cancelar => retornar para home

## body api

antes de salvar tem que salvar o arquivo

```js
const axios = require('axios');
const FormData = require('form-data');
const data = new FormData();
data.append('file', '');

const response = await axios.post('https://api.example.com/upload', data, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
```

```json
{
 "nome": "string",
 "value": "number",
 "walletId": "string",
 "proofId": "string",
 "typePayment": "string",
 "createdPg": "Date",
 "paymentDueDate": "Date",
 "gps": "object",
 "timezone": "string"
}
```







