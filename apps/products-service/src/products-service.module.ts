import { Module } from '@nestjs/common';
import { ProductsServiceController } from './products-service.controller';
import { ProductsServiceService } from './products-service.service';
import { ProductsFacade } from './products.facade';

@Module({
  imports: [],
  controllers: [ProductsServiceController],
  providers: [ProductsServiceService, ProductsFacade],
  exports: [ProductsFacade],
})
export class ProductsServiceModule {}
