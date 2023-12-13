import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';
import { isInt, isPositive } from 'class-validator';
import { NotFoundException } from '@nestjs/common';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductService],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  describe('findAll', () => {
    //
    it('should be defined', () => {
      expect(service.findAll()).toBeDefined();
    });

    //El metodo Array.isArray() verifica si recibe un arreglo y devuelve un valor booleano.
    it('should return an array of products', async () => {
      const result: Product[] = await service.findAll();
      expect(Array.isArray(result)).toBe(true);
    });

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
  });

  describe('findById', () => {
    it('must be a valid id', async () => {
      //Verificamos que efectivamente este llegando un numero y que sea positivo.
      const resultOk = await service.findById(1);
      expect(isInt(resultOk.id) && isPositive(resultOk.id)).toBe(true);
    });

    it('must return an exception (404)', async () => {
      //Verificamos que, cuando se envie un id inexistente por parametro, devuelva la excepcion correspondiente.
      const inexistentId: number = 1500;
      await expect(async () => service.findById(inexistentId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should comply with basic syntax', async () => {
      //Verificamos si el objeto que devuelve cumple con la estructura basica.
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

  jest.mock('./product.service.ts');

  // describe('create', () => {
  //   it('should return a new product successfully', async () => {
  //     const newProduct = {
  //       id: 2,
  //       description: 'Description for the new product',
  //       price: 19.99,
  //       stock: 100,
  //     };

  //     const createSpy = jest.spyOn(service, 'create');

  //     service.create(newProduct);

  //     expect(createSpy).toHaveBeenCalledWith(newProduct);
  //   });
  // });
});
