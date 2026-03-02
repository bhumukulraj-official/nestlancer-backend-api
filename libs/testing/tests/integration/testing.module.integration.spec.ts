import { Test, TestingModule as NestTestingModule } from '@nestjs/testing';
import { TestingModule } from '../../src/testing.module';
import { ConfigModule } from '@nestjs/config';

describe('TestingModule (Integration)', () => {
  let module: NestTestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.test' }),
        TestingModule,
      ],
    }).compile();
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });
});
