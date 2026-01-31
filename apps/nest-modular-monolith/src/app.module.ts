import { Module } from '@nestjs/common';
import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';
import { UsersServiceModule } from '../../users-service/src/users-service.module';
import { ProductsServiceModule } from '../../products-service/src/products-service.module';

@Module({
  imports: [UsersServiceModule, ProductsServiceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
