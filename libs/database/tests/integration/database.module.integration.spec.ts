import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from '../../src/database.module';
import { PrismaWriteService } from '../../src/prisma-write.service';
import { PrismaReadService } from '../../src/prisma-read.service';
import { ConfigModule } from '@nestjs/config';

describe('DatabaseModule (Integration)', () => {
  let module: TestingModule;
  let writeService: PrismaWriteService;
  let readService: PrismaReadService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.test' }),
        DatabaseModule.forRoot(),
      ],
    }).compile();

    writeService = module.get<PrismaWriteService>(PrismaWriteService);
    readService = module.get<PrismaReadService>(PrismaReadService);

    await module.init();
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(writeService).toBeDefined();
    expect(readService).toBeDefined();
  });

  it('should provide separate instances for read and write', () => {
    expect(writeService).not.toBe(readService);
  });

  it('should connect write service to database', async () => {
    // Execute a raw query to verify connection
    const result = await writeService.$queryRaw`SELECT 1 as connected`;
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should connect read service to database', async () => {
    const result = await readService.$queryRaw`SELECT 1 as connected`;
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should be able to query current timestamp from database', async () => {
    const result: any[] = await writeService.$queryRaw`SELECT NOW() as server_time`;
    expect(result).toHaveLength(1);
    expect(result[0].server_time).toBeDefined();
  });
});
