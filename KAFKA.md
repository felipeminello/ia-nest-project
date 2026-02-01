# Kafka Integration Guide

## Visão Geral

Este projeto integra Apache Kafka para comunicação assíncrona entre serviços. A biblioteca `@app/common` fornece classes reutilizáveis de Producer e Consumer.

## Arquitetura

```
libs/common/src/kafka/
├── interfaces/
│   └── kafka.interface.ts      # Interfaces TypeScript
├── services/
│   ├── kafka-producer.service.ts  # Serviço Producer
│   └── kafka-consumer.service.ts  # Serviço Consumer
├── kafka.module.ts             # Módulo Kafka
└── index.ts                    # Exportações
```

## Docker Compose

### Iniciar Serviços

```bash
# Iniciar PostgreSQL e Kafka
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f kafka
docker-compose logs -f postgres

# Parar serviços
docker-compose down

# Parar e remover volumes
docker-compose down -v
```

### Serviços Disponíveis

- **PostgreSQL**: porta 5432
- **Kafka**: porta 9092 (cliente), 9093 (controller)

## Configuração

### Variáveis de Ambiente

Adicione ao arquivo `.env`:

```env
# Kafka Configuration
KAFKA_CLIENT_ID=nest-app
KAFKA_BROKERS=localhost:9092
KAFKA_GROUP_ID=nest-app-group
```

### Importar Módulo

```typescript
import { Module } from '@nestjs/common';
import { CommonModule } from '@app/common';

@Module({
  imports: [CommonModule],
  // ...
})
export class YourModule {}
```

## Uso do Producer

### Injetar Serviço

```typescript
import { Injectable } from '@nestjs/common';
import { KafkaProducerService } from '@app/common';

@Injectable()
export class YourService {
  constructor(
    private readonly kafkaProducerService: KafkaProducerService,
  ) {}

  async publishEvent() {
    await this.kafkaProducerService.sendMessage({
      topic: 'your.topic',
      key: 'unique-key',
      value: { data: 'your data' },
      headers: { source: 'your-service' },
    });
  }
}
```

### Enviar Mensagem Única

```typescript
await this.kafkaProducerService.sendMessage({
  topic: 'product.created',
  key: product.id,
  value: product,
});
```

### Enviar em Lote

```typescript
await this.kafkaProducerService.sendBatch('product.batch', [
  { key: '1', value: product1 },
  { key: '2', value: product2 },
]);
```

## Uso do Consumer

### Criar Consumer

```typescript
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { KafkaConsumerService } from '@app/common';
import { EachMessagePayload } from 'kafkajs';

@Injectable()
export class YourKafkaConsumer implements OnModuleInit {
  private readonly logger = new Logger(YourKafkaConsumer.name);

  constructor(
    private readonly kafkaConsumerService: KafkaConsumerService,
  ) {}

  async onModuleInit() {
    // Inscrever em tópicos
    await this.kafkaConsumerService.subscribe(
      'your.topic',
      this.handleMessage.bind(this),
    );

    // Iniciar consumo
    await this.kafkaConsumerService.startConsuming();
  }

  private async handleMessage(payload: EachMessagePayload): Promise<void> {
    try {
      const data = this.kafkaConsumerService.parseMessage(payload);
      this.logger.log(`Received: ${JSON.stringify(data)}`);
      
      // Processar mensagem
      // ...
    } catch (error) {
      this.logger.error('Error processing message', error);
    }
  }
}
```

### Registrar no Módulo

```typescript
@Module({
  imports: [CommonModule],
  providers: [YourService, YourKafkaConsumer],
})
export class YourModule {}
```

## Exemplo: Products Service

### Producer (Publicar Eventos)

O `ProductsServiceService` publica eventos automaticamente:

- **product.created**: quando um produto é criado
- **product.updated**: quando um produto é atualizado
- **product.deleted**: quando um produto é deletado

```typescript
// Exemplo de criação
const product = await productsService.create({
  name: 'Product A',
  price: 100,
  stock: 10,
});
// Evento 'product.created' é publicado automaticamente
```

### Consumer (Consumir Eventos)

O `ProductsKafkaConsumer` consome eventos de produtos:

```typescript
// Escuta eventos de produtos
- product.created
- product.updated
- product.deleted

// Adicione sua lógica de negócio nos handlers
```

## Tópicos Kafka

### Convenção de Nomes

Use a convenção `<entity>.<action>`:

- `product.created`
- `product.updated`
- `product.deleted`
- `user.registered`
- `order.placed`

### Criar Tópicos Manualmente

```bash
# Entrar no container Kafka
docker exec -it nest-kafka bash

# Criar tópico
kafka-topics.sh --create \
  --bootstrap-server localhost:9092 \
  --topic your.topic \
  --partitions 3 \
  --replication-factor 1

# Listar tópicos
kafka-topics.sh --list --bootstrap-server localhost:9092

# Descrever tópico
kafka-topics.sh --describe \
  --bootstrap-server localhost:9092 \
  --topic your.topic
```

## Ferramentas de Debug

### Console Producer

```bash
docker exec -it nest-kafka bash

kafka-console-producer.sh \
  --bootstrap-server localhost:9092 \
  --topic test.topic
```

### Console Consumer

```bash
docker exec -it nest-kafka bash

kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic product.created \
  --from-beginning
```

## Boas Práticas

### 1. Tratamento de Erros

```typescript
try {
  await this.kafkaProducerService.sendMessage({...});
} catch (error) {
  this.logger.error('Failed to publish event', error);
  // Não falhe a operação principal
}
```

### 2. Idempotência

Use `key` para garantir idempotência:

```typescript
await this.kafkaProducerService.sendMessage({
  topic: 'product.updated',
  key: product.id, // Garante ordem por produto
  value: product,
});
```

### 3. Dead Letter Queue

Para mensagens com falha, considere implementar DLQ:

```typescript
private async handleMessage(payload: EachMessagePayload): Promise<void> {
  try {
    // Processar mensagem
  } catch (error) {
    // Enviar para DLQ
    await this.kafkaProducerService.sendMessage({
      topic: 'dlq.your-topic',
      value: { originalMessage: payload, error: error.message },
    });
  }
}
```

### 4. Logging

Use níveis apropriados de log:

```typescript
this.logger.log('Normal operation');
this.logger.warn('Non-critical issue');
this.logger.error('Critical error', error);
```

## Monitoramento

### Health Checks

Os containers incluem health checks:

```bash
# Ver status de saúde
docker-compose ps
```

### Logs

```bash
# Kafka
docker-compose logs -f kafka

# Aplicação
npm run start:dev
```

## Troubleshooting

### Kafka não conecta

1. Verifique se o container está rodando: `docker-compose ps`
2. Verifique os logs: `docker-compose logs kafka`
3. Verifique a porta: `netstat -an | grep 9092`

### Consumer não recebe mensagens

1. Verifique se o tópico existe
2. Verifique se `startConsuming()` foi chamado
3. Verifique logs do consumer
4. Verifique o group ID

### Mensagens duplicadas

1. Revise a lógica de idempotência
2. Verifique o `key` nas mensagens
3. Considere usar transações Kafka

## Performance

### Configurações para Produção

```typescript
// Ajuste para produção
KAFKA_GROUP_ID=nest-app-group-prod
DB_SYNC=false // Use migrations

// No docker-compose.yml, ajuste:
KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 3
KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 3
```

### Batch Processing

Use `sendBatch` para melhor throughput:

```typescript
const messages = products.map(p => ({
  key: p.id,
  value: p,
}));

await this.kafkaProducerService.sendBatch('products.batch', messages);
```

## Próximos Passos

1. Implementar Schema Registry (Avro/Protobuf)
2. Adicionar métricas (Prometheus)
3. Implementar SAGA pattern
4. Adicionar Kafka Streams para processamento complexo
5. Configurar backup e disaster recovery
