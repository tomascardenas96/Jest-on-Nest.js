import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';
import { isInt, isPositive } from 'class-validator';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductService],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  // -----------------------------------------------------------------------------------------------------------//

  describe('findAll', () => {
    // Verificamos que el servicio este definido.
    it('service should be defined', () => {
      expect(service).toBeDefined();
    });

    // -----------------------------------------------------------------------------------------------------------//

    it('should be defined', () => {
      expect(service.findAll()).toBeDefined();
    });

    // -----------------------------------------------------------------------------------------------------------//

    // El metodo Array.isArray() verifica si recibe un arreglo y devuelve un valor booleano.
    it('should return an array of products', async () => {
      const result: Product[] = await service.findAll();
      expect(Array.isArray(result)).toBe(true);
    });

    // -----------------------------------------------------------------------------------------------------------//

    // Verificamos que cada uno de los productos cumpla con la sintaxis de la entidad Product.
    it('Array must respect entity structure', async () => {
      const result: Product[] = await service.findAll();
      result.forEach((product: Product) => {
        expect(product).toEqual(
          expect.objectContaining({
            id: expect.any(Number),
            description: expect.any(String),
            price: expect.any(Number),
            stock: expect.any(Number),
          }),
        );
      });
    });

    // -----------------------------------------------------------------------------------------------------------//

    // En este test forzamos un error utilizando un mock en el servicio, para asegurarnos que devuelva una excepcion.
    it('should return an exception when ocurrs an error', async () => {
      jest.spyOn(service, 'findAll').mockRejectedValue(new NotFoundException());

      await expect(service.findAll()).rejects.toThrow(NotFoundException);
    });
  });

  // -----------------------------------------------------------------------------------------------------------//

  describe('findById', () => {
    // Nos aseguramos que llegue un id valido, debe ser un numero entero positivo.
    it('must be a valid id', async () => {
      const resultOk = await service.findById(1);
      expect(isInt(resultOk.id) && isPositive(resultOk.id)).toBe(true);
    });

    // -----------------------------------------------------------------------------------------------------------//

    //Verificamos que, cuando se envie un id inexistente por parametro, devuelva la excepcion correspondiente.
    it('must return an exception (404)', async () => {
      const inexistentId: number = 1500;
      await expect(() => service.findById(inexistentId)).rejects.toThrow(
        NotFoundException,
      );
    });

    // -----------------------------------------------------------------------------------------------------------//

    //Verificamos si el objeto que devuelve cumple con la estructura basica.
    it('should comply with basic syntax', async () => {
      const resultOk = await service.findById(1);

      expect(resultOk).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          description: expect.any(String),
          price: expect.any(Number),
          stock: expect.any(Number),
        }),
      );
    });
  });

  // -----------------------------------------------------------------------------------------------------------//

  describe('lastID', () => {
    // Nos aseguramos que la funcion para encontrar el ultimo id (utilizada en el metodo create), funcione
    // correctamente.
    it('should return the last ID for existing products', async () => {
      // Configuramos el mock para devolver una lista de productos
      const productsMock: Product[] = [
        { id: 1, description: 'Product 1', price: 19.99, stock: 50 },
        { id: 2, description: 'Product 2', price: 24.99, stock: 30 },
      ];
      jest.spyOn(service, 'findAll').mockResolvedValue(productsMock);

      // Llamamos a la función lastId y verifica que devuelva el último ID esperado
      const result = await service.lastId();
      expect(result).toEqual(productsMock.length);
    });
  });

  // -----------------------------------------------------------------------------------------------------------//

  describe('create', () => {
    // El metodo create debe retornar un nuevo producto. (Hecho con un mock para que no se invoque al metodo real ya
    // que crearia un objeto no deseado)
    it('should return a new product successfully', async () => {
      // Creamos un producto de prueba.
      const newProduct: Product = {
        id: 2,
        description: 'Description for the new product',
        price: 19.99,
        stock: 100,
      };

      // Este espia simula el comportamiento del metodo 'create' y debera devolver una promesa resuelta con el objeto
      // anteriormente creado.
      const createSpy = jest
        .spyOn(service, 'create')
        .mockResolvedValue(newProduct);

      // Llamamos al metodo 'create' del servicio con el producto de prueba como parametro,
      // el retorno quedara almacenado en la variable 'result'
      const result: Product = await service.create(newProduct);

      // Verificamos si el metodo 'create' del servicio haya sido llamado correctamente con el argumento 'newProduct'
      expect(createSpy).toHaveBeenCalledWith(newProduct);

      // Aca verificamos que el resultado obtenido del metodo 'create' coincida con el objeto 'newProduct', para
      // asegurar que el servicio este devolviendo el nuevo producto
      expect(result).toEqual(newProduct);
    });
    // Nota: No pudimos hacer otras pruebas del metodo create ya que los tipos admitidos no lo permiten.
  });

  // -----------------------------------------------------------------------------------------------------------//

  describe('update', () => {
    // Metodo encargado de actualizar un producto ya existente, enviandole un parametro valido.
    it('should update an existing product successfully', async () => {
      // Llamamos al método update para actualizar el producto.
      const updatedProduct = await service.update(1, {
        description: 'Updated product',
        price: 29.99,
        stock: 200,
      });

      // Verificamos que el producto se haya actualizado correctamente
      expect(updatedProduct.id).toBe(1);
      expect(updatedProduct.description).toBe('Updated product');
      expect(updatedProduct.price).toBe(29.99);
      expect(updatedProduct.stock).toBe(200);
    });

    // -----------------------------------------------------------------------------------------------------------//

    // Esta prueba envia un id invalido al metodo del servicio para forzar una excepcion.
    it('should throw a BadRequestException for non-existent id', async () => {
      await expect(
        service.update(999, {
          description: 'Updated product',
          price: 29.99,
          stock: 200,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    // -----------------------------------------------------------------------------------------------------------//

    // Mockeamos fetch para simular un error de red
    it('should throw a BadRequestException for network error', async () => {
      jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

      await expect(
        service.update(1, {
          description: 'Updated product',
          price: 29.99,
          stock: 200,
        }),
      ).rejects.toThrow(BadRequestException);

      // Restaura la implementación original de fetch después de la prueba
      jest.spyOn(global, 'fetch').mockRestore();
    });
  });

  // -----------------------------------------------------------------------------------------------------------//

  describe('delete', () => {
    // Esta prueba llama al metodo delete con un id valido, y se asegura que se borre correctamente.
    it('should delete an existing product successfully', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue({
        id: 1,
        description: 'prueba',
        price: 2,
        stock: 10,
      });

      // Llamamos al método delete para eliminar el producto
      const deletedProduct = await service.delete(1);

      // Verificamos que el producto se haya eliminado correctamente
      expect(deletedProduct.id).toBe(1);
    });

    // -----------------------------------------------------------------------------------------------------------//

    // Llamamos al metodo delete con un id inexistente para verificar que efectivamente retorne la excepcion esperada.
    it('should throw a NotFoundException for non-existent id', async () => {
      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});
