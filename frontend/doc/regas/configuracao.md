# página de configuração

## rota
`/configuracoes`

### objetivo
criar uma página de configuração para editar as configurações do usuário, essa pagina vai ter os seguintes campos:
- nome
- email
- Cardeneta
- redefinir senha

### regras

- para pegar as infamações do usuário na api usando o id que esta no localStorage userId
- o nome deve ter pelo menos 3 caracteres
- o email deve ter pelo menos 3 caracteres 
- o email dev ter um validador de email
- a Cardeneta mostra uma tabela pequena com as informações do wallet id e o nome do wallet
- a Cardeneta tem um botão para adicionar um novo wallet
- para adicionar um novo wallet tem que mandar um post para a api com o id do wallet ja criado
- para adicionar um novo wallet tem que abrir uma modal para adicionar um novo wallet
- para redefinir a senha sera um botão que abre uma modal para redefinir a senha
- no modal de redefinir senha tem que ter um campo para a senha antiga e um campo para a senha nova  e confirmar a senha nova

### Label

- Nome
- Email
- Cardeneta

### Modal de cadastro de carteira

- o modal vai ter um campo para o o código do wallet
- o modal vai ter um botão para salvar o wallet se der tudo certo fecha a modal e recarrega a pagina
- o modal vai ter um botão para cancelar onde fecha a modal

### Modal de redefinir senha

- o modal vai ter um campo para a senha antiga
- o modal vai ter um campo para a senha nova
- o modal vai ter um campo para confirmar a senha nova
- o modal vai ter um botão para salvar a senha se der tudo certo fecha a modal e recarrega a pagina
- o modal vai ter um botão para cancelar onde fecha a modal


### Botão

- Salvar => salvar o formulário se der tudo certo retornar para home
- Cancelar => retornar para home

### body api

- rota da api `/user/{id}`
- update Usuario

```json
{
  "email": "string",
  "name": "string",
}
```

- update user Wallet

```json
{
  "NewWalletId": "string"
}
```

- update user Password

```json
{
  "password": "string",
}
```






