import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommonModule } from '@app/common';
import { ProductsServiceController } from './products-service.controller';
import { ProductsServiceService } from './products-service.service';
import { ProductsFacade } from './products.facade';
import { Product } from './entities/product.entity';
import { ProductsKafkaConsumer } from './kafka/products-kafka.consumer';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'products_db'),
        entities: [Product],
        synchronize: configService.get('DB_SYNC', true),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Product]),
    CommonModule,
  ],
  controllers: [ProductsServiceController],
  providers: [ProductsServiceService, ProductsFacade, ProductsKafkaConsumer],
  exports: [ProductsFacade],
})
export class ProductsServiceModule {}
