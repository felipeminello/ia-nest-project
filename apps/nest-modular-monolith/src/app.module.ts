import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersServiceModule } from '@app/users-service';
import { ProductsServiceModule } from '@app/products-service';

@Module({
  imports: [UsersServiceModule, ProductsServiceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
