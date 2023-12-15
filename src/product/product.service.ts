import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  async findAll(): Promise<Product[]> {
    try {
      const response: Response = await fetch('http://localhost:3150/products');
      if (!response.ok) {
        throw new NotFoundException();
      }
      return response.json();
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async findById(id: number): Promise<Product> {
    try {
      const response: Response = await fetch(
        `http://localhost:3150/products/${id}`,
      );
      const allProducts: Product[] = await this.findAll();
      const productFound: Product = allProducts.find(
        (product) => product.id === id,
      );

      if (productFound) {
        return await response.json();
      } else {
        throw new NotFoundException();
      }
    } catch (error) {
      throw new NotFoundException('Id non-existent');
    }
  }

  async lastId(): Promise<number> {
    const allProducts: Product[] = await this.findAll();
    return allProducts.length;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const { description, price, stock }: CreateProductDto = createProductDto;
      const newProduct: Product = {
        id: (await this.lastId()) + 1,
        description: description,
        price: price,
        stock: stock,
      };
      fetch('http://localhost:3150/products', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      return newProduct;
    } catch (err) {
      throw new BadRequestException();
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      const allProducts: Product[] = await this.findAll();
      const productFound: Product = allProducts.find(
        (product) => product.id === id,
      );

      const { description, price, stock }: UpdateProductDto = updateProductDto;
      const newProduct: Product = {
        id: id,
        description: description ? description : productFound.description,
        price: price ? price : productFound.price,
        stock: stock ? stock : productFound.stock,
      };

      if (productFound) {
        fetch(`http://localhost:3150/products/${id}`, {
          method: 'PATCH',
          headers: { 'Content-type': 'application/json' },
          body: JSON.stringify(newProduct),
        });
        return newProduct;
      } else {
        throw new BadRequestException('id non-existent');
      }
    } catch (err) {
      throw new BadRequestException('id non-existent');
    }
  }

  async delete(id: number) {
    try {
      const allProducts: Product[] = await this.findAll();
      const deletedProduct: Product = allProducts.find(
        (product) => product.id === id,
      );

      if (deletedProduct) {
        fetch(`http://localhost:3150/products/${id}`, {
          method: 'DELETE',
          headers: { 'Content-type': 'application/json' },
        });
        return deletedProduct;
      } else {
        throw new NotFoundException('Id non-existent');
      }
    } catch (err) {
      throw new NotFoundException('Id non-existent');
    }
  }
}
