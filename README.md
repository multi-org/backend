

<h1 align="center">
     MULTI
</h1>

<h3 align="center">
    API para o sistema Multi.
</h3>

<h4 align="center">
	🚧   Em desenvolvimento... 🚀 🚧
</h4>

Tabela de conteúdos
=================
<!--ts-->
   * [Sobre o projeto](#-sobre-o-projeto)
   * [Como executar o projeto](#-como-executar-o-projeto)
     * [Pré-requisitos](#pré-requisitos)
     * [Rodando o Backend (servidor)](#user-content--rodando-o-backend-servidor)
   * [Tecnologias](#-tecnologias)
     * [Server](#user-content-server--nodejs----typescript)
<!--te-->


## 💻 Sobre o projeto

O Multi - A plataforma é projetada para ser uma solução abrangente e eficiente para o gerenciamento de aluguel de espaços, serviços e equipamentos em diversas instituições, atendendo a diferentes tipos de usuários: individuais, empresas, instituições públicas e instituições públicas/privadas.



---


## 🚀 Como executar o projeto


### Pré-requisitos

Antes de começar, você vai precisar ter instalado em sua máquina as seguintes ferramentas:
[Git](https://git-scm.com), [Node.js](https://nodejs.org/en/).
Alem disso tambem é necessario configurar o arquivo .env.

#### 🎲 Rodando o Backend (servidor)

```bash

# Clone este repositório

# Acesse a pasta do projeto

# Instale as dependências
$ npm install

# Execute a aplicação em modo de desenvolvimento
$ npm run start:dev

# O servidor inciará na porta:4000 - acesse http://localhost:4000.
# Tambem será possivel acessar a documentação da API - acesse http://localhost:4000/api-docs.

```

---
## 🚀 Scripts
```bash

# Inicia server.ts
$ npm run start

# Execute a aplicação em modo de desenvolvimento
$ npm run start:dev

# Build da aplicação
$ npm run build

# Corrige erros do eslint e preetier (visual do codigo e possiveis erros de digitação)
$ npm run lint -- --fix

# Inicia testes da aplicação usando Jest
$ npm run test

```

---

## 🛠 Exemplo .env
```bash

DB_CONNECTION_STRING=mongodb+srv://<usuario>:<senha>@projeto-multi.w3rxd.mongodb.net/meuBancoDeDados?retryWrites=true&w=majority&appName=Projeto-MULTI
PORT=4000

```

---

## 🛠 Tecnologias

As seguintes ferramentas foram usadas na construção do projeto:

#### **Server**  ([NodeJS](https://nodejs.org/en/)  +  [TypeScript](https://www.typescriptlang.org/))

-   **[Express](https://expressjs.com/)**
-   **[ts-node](https://github.com/TypeStrong/ts-node)**
-   **[dotENV](https://github.com/motdotla/dotenv)**
-   **[eslint](https://github.com/hapijs/joi)**
-   **[Jest](https://github.com/hapijs/joi)**
-   **[Preetier](https://github.com/hapijs/joi)**
-   **[tsx](https://github.com/hapijs/joi)**
-   **[tsup](https://github.com/hapijs/joi)**
-   **[mongoDB](https://github.com/hapijs/joi)**
-   **[mongoose](https://github.com/hapijs/joi)**
-   **[swagger-ui-express](https://github.com/hapijs/joi)**

> Veja o arquivo  [package.json](https://github.com/tgmarinho/README-ecoleta/blob/master/server/package.json)


#### **Utilitários**

-   Editor:  **[Visual Studio Code](https://code.visualstudio.com/)**
-   Markdown:  **[StackEdit](https://stackedit.io/)**,  **[Markdown Emoji](https://gist.github.com/rxaviers/7360908)**
-   Commit Conventional:  **[Commitlint](https://github.com/conventional-changelog/commitlint)**


---
