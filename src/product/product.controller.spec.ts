import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';

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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array with Product entity syntax', async () => {
      const productMock: Product []= [
        {
          id: 1,
          description: 'Holaa',
          price: 200,
          stock: 1,
        },
        {
          id: 2,
          description: 'Holaa',
          price: 200,
          stock: 1,
        },
        {
          id: 3,
          description: 'Holaa',
          price: 200,
          stock: 1,
        },{
          id: 4,
          description: 'Chau',
          price: 100,
          stock: 30,
        }
      ];

      const productTest = jest.spyOn(service,'findAll').mockReturnValue(Promise.resolve(productMock));

      // Creamos una instancia de controller
      const result = await controller.findAll();

      // Verifica que el método service.findAll fue llamado
      expect(productTest).toHaveBeenCalled();
    
      // Verifica que el resultado del controlador sea igual al array de prueba
      expect(result).toEqual(productMock);
    });
  });
});
