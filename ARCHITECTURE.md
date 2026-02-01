# Arquitetura do Sistema

## Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                    NestJS Modular Monolith                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐      ┌─────────────────┐              │
│  │  Main App       │      │ Products Service│              │
│  │  (Gateway)      │◄────►│   (CRUD + Events)│             │
│  └─────────────────┘      └─────────────────┘              │
│         │                         │                         │
│         │                         ▼                         │
│         │                  ┌─────────────────┐              │
│         │                  │ Users Service   │              │
│         │                  └─────────────────┘              │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────────────────────────┐                   │
│  │      Common Libraries (@app/common)  │                   │
│  ├─────────────────────────────────────┤                   │
│  │  - Kafka Module                     │                   │
│  │    └─ Producer Service              │                   │
│  │    └─ Consumer Service              │                   │
│  │  - Common Services                  │                   │
│  └─────────────────────────────────────┘                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                    │                   │
                    ▼                   ▼
        ┌──────────────────┐  ┌──────────────────┐
        │   PostgreSQL     │  │   Apache Kafka   │
        │   (Database)     │  │   (Messaging)    │
        └──────────────────┘  └──────────────────┘
              :5432                  :9092
```

## Fluxo de Dados - Products Service

### 1. Operações de CRUD (Síncronas)

```
┌──────────┐                                              ┌──────────┐
│  Client  │                                              │PostgreSQL│
└────┬─────┘                                              └────┬─────┘
     │                                                          │
     │  POST /products                                          │
     ├─────────────────►┌─────────────────────┐                │
     │                  │ ProductsController  │                │
     │                  └──────────┬──────────┘                │
     │                             │                           │
     │                             ▼                           │
     │                  ┌─────────────────────┐                │
     │                  │ ProductsService     │                │
     │                  └──────────┬──────────┘                │
     │                             │                           │
     │                             │ save()                    │
     │                             ├──────────────────────────►│
     │                             │                           │
     │                             │◄──────────────────────────┤
     │                             │   Product                 │
     │  201 Created                │                           │
     │◄────────────────────────────┤                           │
     │    { product }              │                           │
     │                             │                           │
```

### 2. Publicação de Eventos (Assíncrona)

```
┌─────────────────────┐                              ┌──────────┐
│ ProductsService     │                              │  Kafka   │
└──────────┬──────────┘                              └────┬─────┘
           │                                              │
           │  After save()                                │
           ├──────────────►┌──────────────────┐           │
           │               │ KafkaProducer    │           │
           │               └────────┬─────────┘           │
           │                        │                     │
           │                        │ sendMessage()       │
           │                        │  topic: product.created
           │                        ├────────────────────►│
           │                        │                     │
           │                        │  ✓ ACK              │
           │                        │◄────────────────────┤
           │                        │                     │
           │  ✓ Event Published     │                     │
           │◄───────────────────────┤                     │
           │                                              │
```

### 3. Consumo de Eventos (Assíncrona)

```
┌──────────┐                                     ┌──────────────────────┐
│  Kafka   │                                     │ProductsKafkaConsumer │
└────┬─────┘                                     └──────────┬───────────┘
     │                                                      │
     │  New message on 'product.created'                   │
     │                     ┌──────────────────┐             │
     │                     │ KafkaConsumer    │             │
     │                     └────────┬─────────┘             │
     │                              │                       │
     │  poll()                      │                       │
     ├─────────────────────────────►│                       │
     │                              │                       │
     │  message                     │ handleProductCreated()│
     │                              ├──────────────────────►│
     │                              │                       │
     │                              │                       │ Process
     │                              │                       │ (log, notify,
     │                              │                       │  update cache)
     │                              │                       │
     │                              │  ✓ commit offset     │
     │                              │◄──────────────────────┤
     │◄─────────────────────────────┤                       │
     │                                                      │
```

## Componentes Principais

### Products Service
```
apps/products-service/
├── entities/
│   └── product.entity.ts        # TypeORM Entity
├── dto/
│   ├── create-product.dto.ts    # Validação de entrada
│   └── update-product.dto.ts    # Validação de atualização
├── kafka/
│   └── products-kafka.consumer.ts  # Event Consumer
├── products-service.controller.ts  # HTTP Endpoints
├── products-service.service.ts     # Business Logic + Producer
└── products-service.module.ts      # Module Configuration
```

### Common Library (Kafka)
```
libs/common/src/kafka/
├── interfaces/
│   └── kafka.interface.ts
├── services/
│   ├── kafka-producer.service.ts  # Publish events
│   └── kafka-consumer.service.ts  # Subscribe to events
└── kafka.module.ts                # @Global module
```

## Event Flow - Example

### Criar Produto

```
1. Client Request:
   POST /products
   { name: "Product A", price: 100, stock: 10 }

2. Database:
   INSERT INTO products (...)
   ↓
   Product { id: "uuid-123", ... }

3. Kafka Event:
   Topic: product.created
   Key: "uuid-123"
   Value: { id: "uuid-123", name: "Product A", ... }

4. Consumers (podem ser múltiplos):
   - ProductsKafkaConsumer: Log do evento
   - NotificationsService: Enviar email
   - CacheService: Atualizar cache
   - AnalyticsService: Registrar métrica
```

## Padrões Utilizados

### 1. Repository Pattern
```typescript
ProductsService → Repository<Product> → PostgreSQL
```

### 2. Event-Driven Architecture
```typescript
Action → Database → Kafka Event → Multiple Consumers
```

### 3. Dependency Injection
```typescript
@Injectable()
class ProductsService {
  constructor(
    @InjectRepository(Product) repository,
    private kafkaProducer: KafkaProducerService
  ) {}
}
```

### 4. Module Pattern
```typescript
@Module({
  imports: [CommonModule],  // Shared services
  providers: [Service],
  controllers: [Controller],
  exports: [Facade]          // Public API
})
```

## Escalabilidade

### Horizontal Scaling (Kafka)
```
Consumer Group: nest-app-group

Instance 1  ──┐
Instance 2  ──┼──► Kafka Topic (3 partitions)
Instance 3  ──┘
                  ├─ Partition 0 → Instance 1
                  ├─ Partition 1 → Instance 2
                  └─ Partition 2 → Instance 3
```

### Database Scaling
```
Write: Master Database
Read: Replica 1, Replica 2, Replica 3 (Read-only)
```

## Monitoramento

### Health Checks
```
/health/kafka    → Kafka connection status
/health/db       → Database connection status
/health/ready    → Application ready
```

### Logs
```
Producer: Message sent to topic X
Consumer: Processing message from topic X
Service:  Business logic execution
```

### Metrics (Futuro)
```
- Messages published/sec
- Messages consumed/sec
- Database query time
- API response time
```

## Segurança

### Database
- Connection pooling
- Prepared statements (TypeORM)
- SSL/TLS (production)

### Kafka
- SASL authentication (production)
- SSL/TLS encryption (production)
- ACLs per topic (production)

### API
- Validation (class-validator)
- Sanitization
- Rate limiting (futuro)
- Authentication (futuro)
