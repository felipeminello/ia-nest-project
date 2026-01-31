import { Module } from '@nestjs/common';
import { ProductsServiceController } from '@app/products-service.controller';
import { ProductsServiceService } from '@app/products-service.service';
import { ProductsFacade } from '@app/products.facade';

@Module({
  imports: [],
  controllers: [ProductsServiceController],
  providers: [ProductsServiceService, ProductsFacade],
  exports: [ProductsFacade],
})
export class ProductsServiceModule {}
