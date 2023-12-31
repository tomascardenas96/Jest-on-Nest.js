import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  UsePipes,
  Patch,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ValidationPipe } from '@nestjs/common/pipes';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // Metodo que devuelve el arreglo completo que proviene del json-server.
  @Get()
  async findAll(): Promise<Product[]> {
    return await this.productService.findAll();
  }

  // Devuelve solo un producto que coincida con el id proporcionado por parametro.
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    const product = await this.productService.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  // Agrega un nuevo producto al arreglo, utilizando pipes para transformar los datos provenientes del usuario
  // a los tipos de datos efectuados en el DTO.
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productService.create(createProductDto);
  }

  // Metodo que actualiza un producto, puede modificar uno o mas valores sin la necesidad de modificar el objeto completo. Al igual que el metodo anterior tambien utiliza pipes de validacion
  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    try {
      const response = this.productService.update(id, updateProductDto);
      if (!response) {
        throw new BadRequestException();
      }
      return response;
    } catch (err) {
      throw new BadRequestException();
    }
  }

  // Este metodo se encarga de borrar un producto, proporcionando el id del producto por parametro.
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    try {
      const response = this.productService.delete(id);
      if (!response) {
        throw new NotFoundException();
      }
      return response;
    } catch (err) {
      throw new NotFoundException();
    }
  }
}
