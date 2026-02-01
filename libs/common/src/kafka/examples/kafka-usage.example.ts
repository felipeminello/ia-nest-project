import { Injectable, Logger } from '@nestjs/common';
import { KafkaProducerService, KafkaConsumerService } from '@app/common';
import { EachMessagePayload } from 'kafkajs';

/**
 * Exemplo de uso do Kafka Producer e Consumer
 *
 * Este arquivo demonstra como usar os serviços Kafka na sua aplicação.
 * NÃO é necessário usar este arquivo diretamente - use os exemplos como referência.
 */

@Injectable()
export class KafkaExampleService {
  private readonly logger = new Logger(KafkaExampleService.name);

  constructor(
    private readonly kafkaProducer: KafkaProducerService,
    private readonly kafkaConsumer: KafkaConsumerService,
  ) {}

  // ==========================================
  // EXEMPLOS DE PRODUCER
  // ==========================================

  /**
   * Exemplo 1: Enviar mensagem simples
   */
  async publishSimpleMessage() {
    await this.kafkaProducer.sendMessage({
      topic: 'example.topic',
      value: { message: 'Hello Kafka!' },
    });
  }

  /**
   * Exemplo 2: Enviar mensagem com key (para garantir ordem)
   */
  async publishMessageWithKey(userId: string, data: any) {
    await this.kafkaProducer.sendMessage({
      topic: 'user.events',
      key: userId, // Mensagens com a mesma key vão para a mesma partição
      value: data,
    });
  }

  /**
   * Exemplo 3: Enviar mensagem com headers
   */
  async publishMessageWithHeaders(eventData: any) {
    await this.kafkaProducer.sendMessage({
      topic: 'events.topic',
      key: eventData.id,
      value: eventData,
      headers: {
        source: 'products-service',
        version: '1.0',
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Exemplo 4: Enviar múltiplas mensagens em lote (melhor performance)
   */
  async publishBatchMessages(items: any[]) {
    const messages = items.map((item) => ({
      key: item.id,
      value: item,
    }));

    await this.kafkaProducer.sendBatch('batch.topic', messages);
  }

  /**
   * Exemplo 5: Publicar com tratamento de erro
   */
  async publishWithErrorHandling(data: any) {
    try {
      await this.kafkaProducer.sendMessage({
        topic: 'important.events',
        value: data,
      });
      this.logger.log('Event published successfully');
    } catch (error) {
      this.logger.error('Failed to publish event', error);
      // Não falhe a operação principal
      // Considere retry ou salvar em DLQ
    }
  }

  // ==========================================
  // EXEMPLOS DE CONSUMER
  // ==========================================

  /**
   * Exemplo 6: Configurar consumidor básico
   * Use isso no onModuleInit() do seu serviço
   */
  async setupBasicConsumer() {
    await this.kafkaConsumer.subscribe(
      'example.topic',
      this.handleExampleMessage.bind(this),
    );

    await this.kafkaConsumer.startConsuming();
  }

  private async handleExampleMessage(
    payload: EachMessagePayload,
  ): Promise<void> {
    try {
      const data = this.kafkaConsumer.parseMessage(payload);
      this.logger.log(`Received message: ${JSON.stringify(data)}`);

      // Processar mensagem
      // ...
    } catch (error) {
      this.logger.error('Error processing message', error);
    }
  }

  /**
   * Exemplo 7: Consumer com múltiplos tópicos
   */
  async setupMultiTopicConsumer() {
    // Inscrever em múltiplos tópicos
    await this.kafkaConsumer.subscribe(
      'user.created',
      this.handleUserCreated.bind(this),
    );

    await this.kafkaConsumer.subscribe(
      'user.updated',
      this.handleUserUpdated.bind(this),
    );

    await this.kafkaConsumer.subscribe(
      'user.deleted',
      this.handleUserDeleted.bind(this),
    );

    // Iniciar consumo
    await this.kafkaConsumer.startConsuming();
  }

  private async handleUserCreated(payload: EachMessagePayload): Promise<void> {
    const user = this.kafkaConsumer.parseMessage(payload);
    this.logger.log(`User created: ${user.id}`);
  }

  private async handleUserUpdated(payload: EachMessagePayload): Promise<void> {
    const user = this.kafkaConsumer.parseMessage(payload);
    this.logger.log(`User updated: ${user.id}`);
  }

  private async handleUserDeleted(payload: EachMessagePayload): Promise<void> {
    const data = this.kafkaConsumer.parseMessage(payload);
    this.logger.log(`User deleted: ${data.id}`);
  }

  /**
   * Exemplo 8: Consumer com retry logic
   */
  private async handleMessageWithRetry(
    payload: EachMessagePayload,
    maxRetries = 3,
  ): Promise<void> {
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        const data = this.kafkaConsumer.parseMessage(payload);

        // Processar mensagem
        await this.processMessage(data);

        this.logger.log(
          `Message processed successfully after ${attempts + 1} attempts`,
        );
        return;
      } catch (error) {
        attempts++;
        this.logger.warn(`Attempt ${attempts} failed: ${error.message}`);

        if (attempts >= maxRetries) {
          this.logger.error('Max retries reached, sending to DLQ');
          await this.sendToDeadLetterQueue(payload);
          throw error;
        }

        // Aguardar antes de tentar novamente (exponential backoff)
        await this.sleep(Math.pow(2, attempts) * 1000);
      }
    }
  }

  private async processMessage(data: any): Promise<void> {
    // Sua lógica de processamento aqui
    this.logger.log(`Processing: ${JSON.stringify(data)}`);
  }

  private async sendToDeadLetterQueue(
    payload: EachMessagePayload,
  ): Promise<void> {
    await this.kafkaProducer.sendMessage({
      topic: 'dlq.messages',
      value: {
        originalTopic: payload.topic,
        partition: payload.partition,
        offset: payload.message.offset,
        value: payload.message.value?.toString(),
        timestamp: new Date().toISOString(),
      },
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Exemplo 9: Acessar metadados da mensagem
   */
  private async handleMessageWithMetadata(
    payload: EachMessagePayload,
  ): Promise<void> {
    const { topic, partition, message } = payload;

    this.logger.log(`
      Topic: ${topic}
      Partition: ${partition}
      Offset: ${message.offset}
      Timestamp: ${message.timestamp}
      Key: ${message.key?.toString()}
    `);

    // Acessar headers
    const headers = message.headers || {};
    const source = headers.source?.toString();
    const version = headers.version?.toString();

    this.logger.log(`Source: ${source}, Version: ${version}`);

    // Processar mensagem
    const data = this.kafkaConsumer.parseMessage(payload);
    // ...
  }
}

/**
 * Como usar em um módulo real:
 *
 * 1. Importar CommonModule:
 *
 *    @Module({
 *      imports: [CommonModule],
 *      providers: [YourService],
 *    })
 *    export class YourModule {}
 *
 * 2. Injetar os serviços no seu service:
 *
 *    @Injectable()
 *    export class YourService {
 *      constructor(
 *        private readonly kafkaProducer: KafkaProducerService,
 *        private readonly kafkaConsumer: KafkaConsumerService,
 *      ) {}
 *    }
 *
 * 3. Para consumer, implementar OnModuleInit:
 *
 *    @Injectable()
 *    export class YourConsumer implements OnModuleInit {
 *      async onModuleInit() {
 *        await this.kafkaConsumer.subscribe('topic', this.handler.bind(this));
 *        await this.kafkaConsumer.startConsuming();
 *      }
 *    }
 */
