import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersServiceModule } from '@apps/users-service/users-service.module';
import { ProductsServiceModule } from '@apps/products-service/products-service.module';

@Module({
  imports: [UsersServiceModule, ProductsServiceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
