import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { KafkaConsumerService, type MessageHandler } from '@app/common';
import type { EachMessagePayload } from 'kafkajs';

@Injectable()
export class ProductsKafkaConsumer implements OnModuleInit {
  private readonly logger = new Logger(ProductsKafkaConsumer.name);

  constructor(private readonly kafkaConsumerService: KafkaConsumerService) {}

  async onModuleInit(): Promise<void> {
    // Subscribe to product-related topics
    await this.kafkaConsumerService.subscribe(
      'product.created',
      this.handleProductCreated.bind(this) as MessageHandler,
    );

    await this.kafkaConsumerService.subscribe(
      'product.updated',
      this.handleProductUpdated.bind(this) as MessageHandler,
    );

    await this.kafkaConsumerService.subscribe(
      'product.deleted',
      this.handleProductDeleted.bind(this) as MessageHandler,
    );

    // Start consuming messages
    await this.kafkaConsumerService.startConsuming();
  }

  private async handleProductCreated(
    payload: EachMessagePayload,
  ): Promise<void> {
    try {
      const product = this.kafkaConsumerService.parseMessage<unknown>(payload);
      this.logger.log(
        `Product created event received: ${JSON.stringify(product)}`,
      );

      // Add your business logic here
      // For example: send notification, update cache, etc.
      return Promise.resolve();
    } catch (error) {
      this.logger.error('Error handling product.created event', error);
      return Promise.resolve();
    }
  }

  private async handleProductUpdated(
    payload: EachMessagePayload,
  ): Promise<void> {
    try {
      const product = this.kafkaConsumerService.parseMessage<unknown>(payload);
      this.logger.log(
        `Product updated event received: ${JSON.stringify(product)}`,
      );

      // Add your business logic here
      return Promise.resolve();
    } catch (error) {
      this.logger.error('Error handling product.updated event', error);
      return Promise.resolve();
    }
  }

  private async handleProductDeleted(
    payload: EachMessagePayload,
  ): Promise<void> {
    try {
      const data = this.kafkaConsumerService.parseMessage<unknown>(payload);
      this.logger.log(
        `Product deleted event received: ${JSON.stringify(data)}`,
      );

      // Add your business logic here
      return Promise.resolve();
    } catch (error) {
      this.logger.error('Error handling product.deleted event', error);
      return Promise.resolve();
    }
  }
}
