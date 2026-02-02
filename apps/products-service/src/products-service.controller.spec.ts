import { Test, TestingModule } from '@nestjs/testing';
import { ProductsServiceController } from './products-service.controller';
import { ProductsServiceService } from './products-service.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { KafkaProducerService } from '@app/common';

describe('ProductsServiceController', () => {
  let productsServiceController: ProductsServiceController;

  const mockProductRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockKafkaProducerService = {
    sendMessage: jest.fn().mockResolvedValue(undefined),
    sendBatch: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ProductsServiceController],
      providers: [
        ProductsServiceService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: KafkaProducerService,
          useValue: mockKafkaProducerService,
        },
      ],
    }).compile();

    productsServiceController = app.get<ProductsServiceController>(
      ProductsServiceController,
    );
    productsServiceService = app.get<ProductsServiceService>(
      ProductsServiceService,
    );
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
      };

      const expectedProduct = {
        id: '1',
        ...createProductDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProductRepository.create.mockReturnValue(expectedProduct);
      mockProductRepository.save.mockResolvedValue(expectedProduct);

      const result = await productsServiceController.create(createProductDto);

      expect(result).toEqual(expectedProduct);
      expect(mockProductRepository.create).toHaveBeenCalledWith(
        createProductDto,
      );
      expect(mockProductRepository.save).toHaveBeenCalledWith(expectedProduct);
      expect(mockKafkaProducerService.sendMessage).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const expectedProducts = [
        {
          id: '1',
          name: 'Product A',
          price: 100,
          stock: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockProductRepository.find.mockResolvedValue(expectedProducts);

      const result = await productsServiceController.findAll();

      expect(result).toEqual(expectedProducts);
      expect(mockProductRepository.find).toHaveBeenCalled();
    });
  });
});
