import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';

export type MessageHandler = (payload: EachMessagePayload) => Promise<void>;

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private kafka: Kafka;
  private consumer: Consumer;
  private messageHandlers: Map<string, MessageHandler> = new Map();

  constructor(private readonly configService: ConfigService) {
    const brokers = this.configService.get<string>(
      'KAFKA_BROKERS',
      'localhost:9092',
    );
    this.kafka = new Kafka({
      clientId: this.configService.get<string>('KAFKA_CLIENT_ID', 'nest-app'),
      brokers: brokers.split(','),
    });
    this.consumer = this.kafka.consumer({
      groupId: this.configService.get<string>(
        'KAFKA_GROUP_ID',
        'nest-app-group',
      ),
    });
  }

  async onModuleInit() {
    try {
      await this.consumer.connect();
      this.logger.log('Kafka Consumer connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect Kafka Consumer', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.consumer.disconnect();
      this.logger.log('Kafka Consumer disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting Kafka Consumer', error);
    }
  }

  async subscribe(topic: string, handler: MessageHandler): Promise<void> {
    try {
      await this.consumer.subscribe({ topic, fromBeginning: true });
      this.messageHandlers.set(topic, handler);
      this.logger.log(`Subscribed to topic: ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to subscribe to topic ${topic}`, error);
      throw error;
    }
  }

  async startConsuming(): Promise<void> {
    try {
      await this.consumer.run({
        eachMessage: async (payload: EachMessagePayload) => {
          const { topic, partition, message } = payload;
          const handler = this.messageHandlers.get(topic);

          if (handler) {
            try {
              this.logger.log(
                `Processing message from topic ${topic}, partition ${partition}, offset ${message.offset}`,
              );
              await handler(payload);
            } catch (error) {
              this.logger.error(
                `Error processing message from topic ${topic}`,
                error,
              );
            }
          } else {
            this.logger.warn(`No handler found for topic ${topic}`);
          }
        },
      });
      this.logger.log('Kafka Consumer started consuming messages');
    } catch (error) {
      this.logger.error('Failed to start consuming messages', error);
      throw error;
    }
  }

  parseMessage<T>(payload: EachMessagePayload): T {
    try {
      const value = payload.message.value?.toString();
      if (!value) {
        throw new Error('Message value is empty or undefined');
      }
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error('Failed to parse message', error);
      throw error;
    }
  }
}
