import { Controller, Get, Param } from '@nestjs/common';
import { UsersServiceService } from './users-service.service';

@Controller('v1/user')
export class UsersServiceController {
  constructor(private readonly usersServiceService: UsersServiceService) {}

  @Get()
  getHello(): string {
    return this.usersServiceService.getHello();
  }

  @Get(':userId/products')
  getProducts(@Param('userId') userId: string) {
    return this.usersServiceService.getUserProducts(userId);
  }
}
