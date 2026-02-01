export interface KafkaConfig {
  clientId: string;
  brokers: string[];
  groupId: string;
}

export interface KafkaMessage<T = any> {
  topic: string;
  key?: string;
  value: T;
  headers?: Record<string, string>;
}
