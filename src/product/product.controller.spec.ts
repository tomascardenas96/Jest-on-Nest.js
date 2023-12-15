import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';
import {
  BadRequestException,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [ProductService],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  // -----------------------------------------------------------------------------------------------------------//

  describe('findAll', () => {
    it('controller should be defined', () => {
      expect(controller).toBeDefined();
    });

    // Este metodo mockea en el service un array de 'Product', para compararlo con lo que retorna el controlador.
    it('should return a list of products', async () => {
      // Configuramos el mock del servicio para devolver una lista de productos simulada
      jest.spyOn(service, 'findAll').mockResolvedValue([
        { id: 1, description: 'Product 1', price: 19.99, stock: 100 },
        { id: 2, description: 'Product 2', price: 29.99, stock: 50 },
      ]);

      // Realizamos la llamada al método findAll del controlador
      const result = await controller.findAll();

      // Verificamos que el resultado sea la lista de productos simulada
      expect(result).toEqual([
        { id: 1, description: 'Product 1', price: 19.99, stock: 100 },
        { id: 2, description: 'Product 2', price: 29.99, stock: 50 },
      ]);
    });

    // -----------------------------------------------------------------------------------------------------------//

    it('should return an array with Product entity syntax', async () => {
      const productMock: Product[] = [
        {
          id: 1,
          description: 'Holaa',
          price: 200,
          stock: 1,
        }
      ];

      const productTest = jest
        .spyOn(service, 'findAll')
        .mockReturnValue(Promise.resolve(productMock));

      // Creamos una instancia de controller
      const result = await controller.findAll();

      // Verificamos que el método service.findAll fue llamado
      expect(productTest).toHaveBeenCalled();

      // Verificamos que el resultado del controlador sea igual al array de prueba
      expect(result).toEqual(productMock);
    });

    // -----------------------------------------------------------------------------------------------------------//

    // Mockeamos el service para simular un error en el servicio, y luego lo comparamos con lo que retornaria el 
    // controlador
    it('should throw an error if the service fails', async () => {
      // Configuramos el mock del servicio para devolver un error
      jest.spyOn(service, 'findAll').mockRejectedValue(new Error('Error forzado'));

      // Verificamos que la llamada al método findAll del controlador lanza un error
      await expect(controller.findAll()).rejects.toThrow(
        new Error('Error forzado'),
      );
    });
  });

  // -----------------------------------------------------------------------------------------------------------//

  describe('findById', () => {
    it('should return a product by ID', async () => {
      const productId = 1;
      // Configuramos un servicio mockeado.
      jest.spyOn(service, 'findById').mockResolvedValue({
        id: productId,
        description: 'Product 1',
        price: 19.99,
        stock: 100,
      });

      // Llamamos al método findById del controlador
      const result = await controller.findById(productId);

      // Verificamos que el resultado sea igual al producto mockeado.
      expect(result).toEqual({
        id: productId,
        description: 'Product 1',
        price: 19.99,
        stock: 100,
      });
    });

    // -----------------------------------------------------------------------------------------------------------//


    it('should throw a NotFoundException for non-existent ID', async () => {
      const nonExistentId = 999;

      // Verificamos que la llamada al método findById del controlador lanza un error NotFoundException
      await expect(controller.findById(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // -----------------------------------------------------------------------------------------------------------//

  describe('create', () => {
    it('should create a new product successfully', async () => {
      const createProductDto: CreateProductDto = {
        description: 'Nuevo producto',
        price: 19.99,
        stock: 50,
      };

      // Configuramos el mock del servicio para devolver el producto creado
      jest.spyOn(service, 'create').mockResolvedValue({
        id: 1,
        ...createProductDto,
      });

      // Realizamos la llamada al método create del controlador
      const result = await controller.create(createProductDto);

      // Verificamos que el resultado sea el producto creado simulado
      expect(result).toEqual({
        id: 1,
        ...createProductDto,
      });
    });
  });

  // -----------------------------------------------------------------------------------------------------------//


  describe('update', () => {
    it('should update a product successfully', async () => {
      const productId = 1;
      
      const updateProductDto: UpdateProductDto = {
        description: 'Producto actualizado',
        price: 29.99,
        stock: 75,
      };
      
      // Configuramos el mock del servicio para devolver una promesa que resuelva en el producto actualizado
      jest.spyOn(service, 'update').mockResolvedValue(
        Promise.resolve<Product>({
          id: productId,
          description: updateProductDto.description,
          price: updateProductDto.price,
          stock: updateProductDto.stock,
        }),
      );

      // Realizamos la llamada al método update del controlador
      const result = await controller.update(productId, updateProductDto);

      // Verificamos que el resultado sea el producto actualizado simulado
      expect(result).toEqual({
        id: productId,
        ...updateProductDto,
      });
    });

    // -----------------------------------------------------------------------------------------------------------//

    it('should throw a BadRequestException for invalid DTO', async () => {
      // Verificamos que la llamada al método update del controlador lanza un error BadRequestException
      await expect(controller.update(1, null)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // -----------------------------------------------------------------------------------------------------------//


  describe('delete', () => {
    it('should delete a product successfully', async () => {
      const productId = 1;

      // Configuramos el mock del servicio para devolver el producto eliminado
      jest.spyOn(service, 'delete').mockResolvedValue({
        id: productId,
        description: 'Producto eliminado',
        price: 19.99,
        stock: 50,
      });

      // Realizamos la llamada al método delete del controlador
      const result = await controller.remove(productId);

      // Verifica que el resultado sea el producto eliminado simulado
      expect(result).toEqual({
        id: productId,
        description: 'Producto eliminado',
        price: 19.99,
        stock: 50,
      });
    });

    // -----------------------------------------------------------------------------------------------------------//

    it('should throw a NotFoundException for non-existent ID', async () => {
      // Creamos un id inexistente para pasarle al metodo delete como parametro.
      const nonExistentId = 8690;

      // Verificamos que la llamada al método delete del controlador lanza un error NotFoundException
      await expect(controller.remove(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
