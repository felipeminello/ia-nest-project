import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsServiceService {
  getHello(): string {
    return 'Hello World!';
  }

  findAllByUserId(userId: string) {
    // Mock data
    return [
      { id: 1, name: 'Product A', userId },
      { id: 2, name: 'Product B', userId },
    ];
  }
}
