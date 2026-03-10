import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from '../../src/database.module';
import { PrismaWriteService } from '../../src/prisma-write.service';
import { PrismaReadService } from '../../src/prisma-read.service';
import { SOFT_DELETE, NOT_DELETED } from '../../src/utils/soft-delete.util';

describe('Database Integration', () => {
  let writeDb: PrismaWriteService;
  let readDb: PrismaReadService;

  let createdUserEmail = '';

  const mockWriteDb = {
    onModuleInit: jest.fn(),
    onModuleDestroy: jest.fn(),
    user: {
      deleteMany: jest.fn(),
      create: jest.fn().mockImplementation(async (args) => {
        createdUserEmail = args.data.email;
        return { id: 1, email: args.data.email, name: args.data.name };
      }),
      update: jest.fn(),
    },
  };

  const mockReadDb = {
    onModuleInit: jest.fn(),
    onModuleDestroy: jest.fn(),
    user: {
      findUnique: jest
        .fn()
        .mockImplementation(async (args) => ({ id: args.where.id, email: createdUserEmail })),
      findFirst: jest.fn().mockResolvedValue(null),
    },
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: PrismaWriteService, useValue: mockWriteDb },
        { provide: PrismaReadService, useValue: mockReadDb },
      ],
    }).compile();

    writeDb = module.get<PrismaWriteService>(PrismaWriteService);
    readDb = module.get<PrismaReadService>(PrismaReadService);

    await writeDb.onModuleInit();
    await readDb.onModuleInit();
  });

  afterAll(async () => {
    await writeDb.onModuleDestroy();
    await readDb.onModuleDestroy();
  });

  it('should connect and query the database', async () => {
    const testUserEmail = `int-test-${Date.now()}@test.com`;

    // Write to DB
    const user = await writeDb.user.create({
      data: {
        email: testUserEmail,
        passwordHash: 'hashedpassword',
        name: 'Integration Test User',
      },
    });
    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.email).toBe(testUserEmail);

    // Read from DB (replicating write for simple test)
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
