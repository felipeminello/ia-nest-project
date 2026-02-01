import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { KafkaConsumerService } from '@app/common';
import { EachMessagePayload } from 'kafkajs';

@Injectable()
export class ProductsKafkaConsumer implements OnModuleInit {
  private readonly logger = new Logger(ProductsKafkaConsumer.name);

  constructor(private readonly kafkaConsumerService: KafkaConsumerService) {}

  async onModuleInit() {
    // Subscribe to product-related topics
    await this.kafkaConsumerService.subscribe(
      'product.created',
      this.handleProductCreated.bind(this),
    );

    await this.kafkaConsumerService.subscribe(
      'product.updated',
      this.handleProductUpdated.bind(this),
    );

    await this.kafkaConsumerService.subscribe(
      'product.deleted',
      this.handleProductDeleted.bind(this),
    );

    // Start consuming messages
    await this.kafkaConsumerService.startConsuming();
  }

  private async handleProductCreated(
    payload: EachMessagePayload,
  ): Promise<void> {
    try {
      const product = this.kafkaConsumerService.parseMessage(payload);
      this.logger.log(
        `Product created event received: ${JSON.stringify(product)}`,
      );

      // Add your business logic here
      // For example: send notification, update cache, etc.
    } catch (error) {
      this.logger.error('Error handling product.created event', error);
    }
  }

  private async handleProductUpdated(
    payload: EachMessagePayload,
  ): Promise<void> {
    try {
      const product = this.kafkaConsumerService.parseMessage(payload);
      this.logger.log(
        `Product updated event received: ${JSON.stringify(product)}`,
      );

      // Add your business logic here
    } catch (error) {
      this.logger.error('Error handling product.updated event', error);
    }
  }

  private async handleProductDeleted(
    payload: EachMessagePayload,
  ): Promise<void> {
    try {
      const data = this.kafkaConsumerService.parseMessage(payload);
      this.logger.log(
        `Product deleted event received: ${JSON.stringify(data)}`,
      );

      // Add your business logic here
    } catch (error) {
      this.logger.error('Error handling product.deleted event', error);
    }
  }
}
