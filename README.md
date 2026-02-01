<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# NestJS Modular Monolith

Um projeto modular monolítico construído com NestJS, TypeORM, PostgreSQL e Apache Kafka.

## 📋 Descrição

Este projeto demonstra uma arquitetura modular monolítica usando NestJS, com os seguintes recursos:

- **Monolito Modular**: Múltiplos serviços em um único repositório
- **PostgreSQL**: Banco de dados relacional com TypeORM
- **Apache Kafka**: Sistema de mensageria para comunicação assíncrona
- **Docker Compose**: Configuração completa de infraestrutura
- **Clean Code & SOLID**: Seguindo boas práticas de desenvolvimento

## 🏗️ Estrutura do Projeto

```
nest-modular-monolith/
├── apps/
│   ├── nest-modular-monolith/    # Aplicação principal
│   ├── products-service/          # Serviço de produtos (com PostgreSQL + Kafka)
│   └── users-service/             # Serviço de usuários
├── libs/
│   └── common/                    # Bibliotecas compartilhadas
│       ├── kafka/                 # Módulo Kafka (Producer/Consumer)
│       └── ...
├── docker-compose.yml             # Infraestrutura (PostgreSQL + Kafka)
└── setup-services.sh              # Script de setup automático
```

## 🚀 Quick Start

### 1. Pré-requisitos

- Node.js >= 18
- Docker & Docker Compose
- npm ou yarn

### 2. Instalação

```bash
# Clonar repositório
git clone <repository-url>
cd nest-modular-monolith

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Iniciar infraestrutura (PostgreSQL + Kafka)
./setup-services.sh
# ou manualmente:
docker-compose up -d
```

### 3. Executar Aplicação

```bash
# Modo desenvolvimento
npm run start:dev

# Modo produção
npm run build
npm run start:prod
```

### 4. Executar Testes

```bash
npm test
```

## 📦 Serviços

### Products Service

Serviço completo de CRUD de produtos com:
- PostgreSQL (TypeORM)
- Kafka Producer/Consumer
- Validação com class-validator
- Testes automatizados

📖 [Documentação completa](apps/products-service/README.md)

**Endpoints:**
- `POST /products` - Criar produto
- `GET /products` - Listar produtos
- `GET /products?userId=xxx` - Listar produtos por usuário
- `GET /products/:id` - Buscar produto
- `PUT /products/:id` - Atualizar produto
- `DELETE /products/:id` - Deletar produto

**Eventos Kafka:**
- `product.created`
- `product.updated`
- `product.deleted`

### Users Service

Serviço de usuários (estrutura base)

## 🔧 Tecnologias

### Core
- **NestJS** - Framework Node.js
- **TypeScript** - Linguagem
- **TypeORM** - ORM para PostgreSQL

### Banco de Dados
- **PostgreSQL** - Banco relacional (última versão)

### Mensageria
- **Apache Kafka** - Sistema de streaming de eventos
- **KafkaJS** - Cliente Kafka para Node.js

### Infraestrutura
- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers

### Qualidade
- **Jest** - Framework de testes
- **ESLint** - Linter
- **Prettier** - Formatador de código
- **class-validator** - Validação de DTOs

## 🐳 Docker Services

### PostgreSQL
```yaml
Host: localhost
Port: 5432
Database: products_db
Username: postgres
Password: postgres
```

### Apache Kafka
```yaml
Bootstrap Server: localhost:9092
Client Port: 9092
Controller Port: 9093
Mode: KRaft (sem Zookeeper)
```

**Comandos úteis:**
```bash
# Ver logs
docker-compose logs -f kafka
docker-compose logs -f postgres

# Parar serviços
docker-compose down

# Resetar dados
docker-compose down -v
```

## 📡 Kafka Integration

### Producer (Publicar Eventos)

```typescript
import { KafkaProducerService } from '@app/common';

await this.kafkaProducer.sendMessage({
  topic: 'product.created',
  key: product.id,
  value: product,
});
```

### Consumer (Consumir Eventos)

```typescript
import { KafkaConsumerService } from '@app/common';

await this.kafkaConsumer.subscribe('product.created', async (payload) => {
  const data = this.kafkaConsumer.parseMessage(payload);
  // Processar mensagem
});

await this.kafkaConsumer.startConsuming();
```

📖 [Documentação completa do Kafka](KAFKA.md)

## 🧪 Testes

```bash
# Testes unitários
npm test

# Testes com watch
npm run test:watch

# Cobertura
npm run test:cov

# Testes E2E
npm run test:e2e
```

## 📝 Variáveis de Ambiente

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=products_db
DB_SYNC=true

# Kafka
KAFKA_CLIENT_ID=nest-app
KAFKA_BROKERS=localhost:9092
KAFKA_GROUP_ID=nest-app-group
```

## 🔐 Boas Práticas

### Clean Code
- Nomes descritivos
- Funções pequenas e focadas
- Evitar duplicação de código
- Comentários apenas quando necessário

### SOLID Principles
- **S**ingle Responsibility
- **O**pen/Closed
- **L**iskov Substitution
- **I**nterface Segregation
- **D**ependency Inversion

### Working Agreements
- Sempre executar `npm test` após modificar arquivos JavaScript/TypeScript
- Solicitar confirmação antes de adicionar novas dependências de produção
- Seguir padrões de código estabelecidos

## 📚 Documentação Adicional

- [Kafka Integration Guide](KAFKA.md)
- [Products Service Documentation](apps/products-service/README.md)
- [Working Agreements](AGENTS.md)

## 🛠️ Scripts Disponíveis

```bash
npm run start          # Iniciar aplicação
npm run start:dev      # Modo desenvolvimento com watch
npm run start:prod     # Modo produção
npm run build          # Build do projeto
npm run test           # Executar testes
npm run lint           # Executar linter
npm run format         # Formatar código
```

## 📄 Licença

Este projeto está sob a licença MIT.

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, siga os working agreements do projeto.

## 📞 Suporte

Para questões e suporte:
- Abra uma issue no GitHub
- Consulte a documentação do NestJS: https://docs.nestjs.com

$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
