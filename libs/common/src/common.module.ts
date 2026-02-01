import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [KafkaModule],
  providers: [CommonService],
  exports: [CommonService, KafkaModule],
})
export class CommonModule {}
