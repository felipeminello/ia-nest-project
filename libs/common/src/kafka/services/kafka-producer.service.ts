import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, Message } from 'kafkajs';
import { KafkaMessage } from '../interfaces/kafka.interface';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private kafka: Kafka;
  private producer: Producer;

  constructor(private readonly configService: ConfigService) {
    this.kafka = new Kafka({
      clientId: this.configService.get('KAFKA_CLIENT_ID', 'nest-app'),
      brokers: this.configService
        .get('KAFKA_BROKERS', 'localhost:9092')
        .split(','),
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.logger.log('Kafka Producer connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect Kafka Producer', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect();
      this.logger.log('Kafka Producer disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting Kafka Producer', error);
    }
  }

  async sendMessage<T>(kafkaMessage: KafkaMessage<T>): Promise<void> {
    const { topic, key, value, headers } = kafkaMessage;

    const message: Message = {
      key: key || null,
      value: JSON.stringify(value),
      headers: headers || {},
    };

    try {
      await this.producer.send({
        topic,
        messages: [message],
      });
      this.logger.log(`Message sent to topic ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to send message to topic ${topic}`, error);
      throw error;
    }
  }

  async sendBatch<T>(
    topic: string,
    messages: KafkaMessage<T>[],
  ): Promise<void> {
    const kafkaMessages: Message[] = messages.map((msg) => ({
      key: msg.key || null,
      value: JSON.stringify(msg.value),
      headers: msg.headers || {},
    }));

    try {
      await this.producer.send({
        topic,
        messages: kafkaMessages,
      });
      this.logger.log(
        `Batch of ${messages.length} messages sent to topic ${topic}`,
      );
    } catch (error) {
      this.logger.error(`Failed to send batch to topic ${topic}`, error);
      throw error;
    }
  }
}
