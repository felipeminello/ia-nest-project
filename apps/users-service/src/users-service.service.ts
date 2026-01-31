import { Injectable } from '@nestjs/common';
import { ProductsFacade } from '@app/products-service';

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
