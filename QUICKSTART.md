# 🚀 Quick Start Guide

## Setup Rápido (5 minutos)

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# O arquivo já está configurado com valores padrão
# Edite se necessário
```

### 3. Iniciar Infraestrutura
```bash
# Opção 1: Script automático (recomendado)
./setup-services.sh

# Opção 2: Manual
docker-compose up -d
```

### 4. Verificar Serviços
```bash
# Ver status dos containers
docker-compose ps

# Deve mostrar:
# - nest-postgres (healthy)
# - nest-kafka (healthy)
```

### 5. Executar Aplicação
```bash
# Modo desenvolvimento (com hot-reload)
npm run start:dev

# A aplicação estará disponível em:
# http://localhost:3000
```

## 🧪 Testar Endpoints

### Criar Produto
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Notebook",
    "description": "Notebook Dell",
    "price": 3500.00,
    "stock": 10
  }'
```

### Listar Produtos
```bash
curl http://localhost:3000/products
```

### Buscar Produto por ID
```bash
curl http://localhost:3000/products/{id}
```

### Atualizar Produto
```bash
curl -X PUT http://localhost:3000/products/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "price": 3200.00,
    "stock": 15
  }'
```

### Deletar Produto
```bash
curl -X DELETE http://localhost:3000/products/{id}
```

## 📊 Monitorar Eventos Kafka

### Terminal 1: Iniciar Aplicação
```bash
npm run start:dev
```

### Terminal 2: Monitorar Eventos
```bash
# Entrar no container Kafka
docker exec -it nest-kafka bash

# Consumir eventos (escolha um tópico)
kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic product.created \
  --from-beginning

# Outros tópicos disponíveis:
# - product.updated
# - product.deleted
```

### Terminal 3: Criar Produtos
```bash
# Use curl ou Postman para criar/atualizar/deletar produtos
# Veja os eventos aparecendo no Terminal 2 em tempo real
```

## 🛠️ Comandos Úteis

### Docker
```bash
# Ver logs
docker-compose logs -f kafka
docker-compose logs -f postgres

# Parar todos os serviços
docker-compose down

# Resetar dados (CUIDADO: apaga tudo)
docker-compose down -v

# Restart de um serviço específico
docker-compose restart kafka
docker-compose restart postgres
```

### Aplicação
```bash
# Desenvolvimento
npm run start:dev

# Build
npm run build

# Produção
npm run start:prod

# Testes
npm test

# Lint
npm run lint

# Format
npm run format
```

### Kafka (dentro do container)
```bash
# Entrar no container
docker exec -it nest-kafka bash

# Listar tópicos
kafka-topics.sh --list --bootstrap-server localhost:9092

# Descrever tópico
kafka-topics.sh --describe \
  --bootstrap-server localhost:9092 \
  --topic product.created

# Criar tópico
kafka-topics.sh --create \
  --bootstrap-server localhost:9092 \
  --topic seu.topico \
  --partitions 3 \
  --replication-factor 1

# Deletar tópico
kafka-topics.sh --delete \
  --bootstrap-server localhost:9092 \
  --topic seu.topico
```

### PostgreSQL
```bash
# Conectar ao banco
docker exec -it nest-postgres psql -U postgres -d products_db

# Comandos SQL úteis
\dt              # Listar tabelas
\d products      # Descrever tabela products
SELECT * FROM products;
```

## 📝 Exemplo de Fluxo Completo

```bash
# 1. Setup
npm install
cp .env.example .env
./setup-services.sh

# 2. Iniciar aplicação
npm run start:dev

# 3. Em outro terminal, monitorar eventos
docker exec -it nest-kafka bash
kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic product.created \
  --from-beginning

# 4. Em outro terminal, criar produto
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15",
    "price": 5000,
    "stock": 20
  }'

# 5. Observe:
# - Response HTTP com o produto criado
# - Evento Kafka no consumer
# - Logs da aplicação
```

## 🐛 Troubleshooting

### Erro: "Cannot connect to Kafka"
```bash
# Verificar se Kafka está rodando
docker-compose ps

# Ver logs do Kafka
docker-compose logs kafka

# Reiniciar Kafka
docker-compose restart kafka
```

### Erro: "Cannot connect to PostgreSQL"
```bash
# Verificar se PostgreSQL está rodando
docker-compose ps

# Ver logs do PostgreSQL
docker-compose logs postgres

# Testar conexão
docker exec nest-postgres pg_isready -U postgres
```

### Erro: "Port already in use"
```bash
# Verificar portas em uso
netstat -an | grep LISTEN | grep -E '(3000|5432|9092)'

# Parar processos usando as portas ou alterar no .env
```

### Resetar Tudo
```bash
# Parar e remover tudo
docker-compose down -v

# Limpar node_modules
rm -rf node_modules package-lock.json

# Reinstalar
npm install

# Setup novamente
./setup-services.sh
npm run start:dev
```

## 📚 Próximos Passos

1. ✅ Ambiente funcionando
2. 📖 Ler [README.md](README.md)
3. 🏗️ Estudar [ARCHITECTURE.md](ARCHITECTURE.md)
4. 📡 Entender [KAFKA.md](KAFKA.md)
5. 🔨 Começar a desenvolver!

## 💡 Dicas

- Use Postman ou Insomnia para testar APIs
- Monitore logs em tempo real com `docker-compose logs -f`
- Use `npm run start:dev` para hot-reload
- Verifique os testes com `npm test` antes de commitar
- Consulte KAFKA.md para exemplos de Producer/Consumer

## 🎯 Features Implementadas

✅ CRUD de Produtos com PostgreSQL  
✅ TypeORM com entidades  
✅ Validação com class-validator  
✅ Kafka Producer (publicar eventos)  
✅ Kafka Consumer (consumir eventos)  
✅ Docker Compose (PostgreSQL + Kafka)  
✅ Testes unitários  
✅ Clean Code & SOLID  
✅ Documentação completa  

## 🚧 Features Futuras

- [ ] Authentication & Authorization
- [ ] API Documentation (Swagger)
- [ ] Migrations (TypeORM)
- [ ] Logging centralizado
- [ ] Metrics (Prometheus)
- [ ] Health checks
- [ ] Rate limiting
- [ ] E2E tests
- [ ] CI/CD pipeline

---

**Pronto para começar! 🎉**

Se tiver problemas, consulte a documentação ou abra uma issue.
