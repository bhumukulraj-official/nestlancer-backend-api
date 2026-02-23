import { Test, TestingModule } from '@nestjs/testing';
import { ShareController } from '../../../src/share/share.controller';
import { ShareService } from '../../../src/share/share.service';

describe('ShareController', () => {
    let controller: ShareController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ShareController],
            providers: [
                {
                    provide: ShareService,
                    useValue: {},
                },
            ],
        }).compile();

        controller = module.get<ShareController>(ShareController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
