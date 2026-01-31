import { Module } from '@nestjs/common';
import { UsersServiceController } from '@app/users-service.controller';
import { UsersServiceService } from '@app/users-service.service';
import { ProductsServiceModule } from '../../products-service/src/products-service.module';

@Module({
  imports: [ProductsServiceModule],
  controllers: [UsersServiceController],
  providers: [UsersServiceService],
})
export class UsersServiceModule {}
