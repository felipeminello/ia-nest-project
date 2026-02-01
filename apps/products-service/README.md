# Products Service - PostgreSQL CRUD

## Descrição

Este módulo implementa um CRUD completo para produtos utilizando PostgreSQL e TypeORM.

## Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=products_db
DB_SYNC=true
```

### 2. Banco de Dados

Certifique-se de ter o PostgreSQL instalado e rodando. Crie o banco de dados:

```sql
CREATE DATABASE products_db;
```

## Estrutura

```
apps/products-service/src/
├── dto/
│   ├── create-product.dto.ts    # DTO para criação de produtos
│   └── update-product.dto.ts    # DTO para atualização de produtos
├── entities/
│   └── product.entity.ts        # Entidade Product do TypeORM
├── products-service.controller.ts
├── products-service.service.ts
├── products-service.module.ts
└── products.facade.ts
```

## Entidade Product

```typescript
{
  id: string (UUID)
  name: string
  description: string (opcional)
  price: number (decimal 10,2)
  stock: number
  userId: string (opcional)
  createdAt: Date
  updatedAt: Date
}
```

## Endpoints da API

### Criar Produto
```http
POST /products
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product Description",
  "price": 99.99,
  "stock": 100,
  "userId": "user-123"
}
```

### Listar Todos os Produtos
```http
GET /products
```

### Listar Produtos por Usuário
```http
GET /products?userId=user-123
```

### Buscar Produto por ID
```http
GET /products/:id
```

### Atualizar Produto
```http
PUT /products/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 149.99
}
```

### Deletar Produto
```http
DELETE /products/:id
```

## Executar a Aplicação

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run start:prod
```

## Testes

```bash
npm test
```

## Dependências Instaladas

- `@nestjs/typeorm`: Integração NestJS com TypeORM
- `typeorm`: ORM para TypeScript/JavaScript
- `pg`: Driver PostgreSQL para Node.js
- `@nestjs/config`: Gerenciamento de configurações
- `class-validator`: Validação de DTOs
- `class-transformer`: Transformação de objetos

## Validação

Os DTOs possuem validação automática utilizando `class-validator`:

- `name`: obrigatório, string
- `description`: opcional, string
- `price`: obrigatório, número >= 0
- `stock`: obrigatório, número >= 0
- `userId`: opcional, string

## Sincronização do Banco de Dados

O TypeORM está configurado para sincronização automática (`synchronize: true`). 

⚠️ **ATENÇÃO**: Em produção, configure `DB_SYNC=false` e utilize migrations para controle de schema.
