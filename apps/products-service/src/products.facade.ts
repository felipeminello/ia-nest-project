import { Injectable } from '@nestjs/common';
import { ProductsServiceService } from './products-service.service';

@Injectable()
export class ProductsFacade {
  constructor(private readonly productsService: ProductsServiceService) {}

  listProductsByUserId(userId: string) {
    return this.productsService.findAllByUserId(userId);
  }
}
