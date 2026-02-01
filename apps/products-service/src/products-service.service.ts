import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { KafkaProducerService } from '@app/common';

@Injectable()
export class ProductsServiceService {
  private readonly logger = new Logger(ProductsServiceService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly kafkaProducerService: KafkaProducerService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    const savedProduct = await this.productRepository.save(product);

    // Publish event to Kafka
    try {
      await this.kafkaProducerService.sendMessage({
        topic: 'product.created',
        key: savedProduct.id,
        value: savedProduct,
      });
      this.logger.log(
        `Product created event published for product ${savedProduct.id}`,
      );
    } catch (error) {
      this.logger.error('Failed to publish product.created event', error);
    }

    return savedProduct;
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async findAllByUserId(userId: string): Promise<Product[]> {
    return await this.productRepository.find({ where: { userId } });
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    const updatedProduct = await this.productRepository.save(product);

    // Publish event to Kafka
    try {
      await this.kafkaProducerService.sendMessage({
        topic: 'product.updated',
        key: updatedProduct.id,
        value: updatedProduct,
      });
      this.logger.log(
        `Product updated event published for product ${updatedProduct.id}`,
      );
    } catch (error) {
      this.logger.error('Failed to publish product.updated event', error);
    }

    return updatedProduct;
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);

    // Publish event to Kafka
    try {
      await this.kafkaProducerService.sendMessage({
        topic: 'product.deleted',
        key: id,
        value: { id, deletedAt: new Date() },
      });
      this.logger.log(`Product deleted event published for product ${id}`);
    } catch (error) {
      this.logger.error('Failed to publish product.deleted event', error);
    }
  }
}
