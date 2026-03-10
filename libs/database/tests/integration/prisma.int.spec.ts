import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from '../../src/database.module';
import { PrismaWriteService } from '../../src/prisma-write.service';
import { PrismaReadService } from '../../src/prisma-read.service';
import { SOFT_DELETE, NOT_DELETED } from '../../src/utils/soft-delete.util';
import { ConfigModule } from '@nestjs/config';

describe('Database Integration', () => {
  let writeDb: PrismaWriteService;
  let readDb: PrismaReadService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.test' }),
        DatabaseModule.forRoot(),
      ],
    }).compile();

    writeDb = module.get<PrismaWriteService>(PrismaWriteService);
    readDb = module.get<PrismaReadService>(PrismaReadService);

    await module.init();
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should connect and query the database', async () => {
    const testUserEmail = `int-test-${Date.now()}@test.com`;

    // Write to DB
    const user = await writeDb.user.create({
      data: {
        email: testUserEmail,
        passwordHash: 'hashedpassword',
        firstName: 'Integration',
        lastName: 'Test User',
      },
    });
    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.email).toBe(testUserEmail);

    // Read from DB
    const foundUser = await readDb.user.findUnique({
      where: { id: user.id },
    });
    expect(foundUser).toBeDefined();
    expect(foundUser?.email).toBe(testUserEmail);

    // Test Soft Delete
    await writeDb.user.update({
      where: { id: user.id },
      data: SOFT_DELETE,
    });

    const deletedUser = await readDb.user.findFirst({
      where: { id: user.id, ...NOT_DELETED },
    });
    expect(deletedUser).toBeNull();
  });
});
