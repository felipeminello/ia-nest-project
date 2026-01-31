import { Injectable } from '@nestjs/common';
import { ProductsFacade } from '../../products-service/src/products.facade';

@Injectable()
export class UsersServiceService {
  constructor(private readonly productsFacade: ProductsFacade) {}

  getHello(): string {
    return 'Hello World!';
  }

  getUserProducts(userId: string) {
    return this.productsFacade.listProductsByUserId(userId);
  }
}
