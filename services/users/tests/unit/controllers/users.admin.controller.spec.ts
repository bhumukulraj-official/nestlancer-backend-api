import { UsersAdminController } from '../../../src/controllers/users.admin.controller';
import { UsersAdminService } from '../../../src/services/users.admin.service';

describe('UsersAdminController', () => {
    let controller: UsersAdminController;
    let adminService: jest.Mocked<UsersAdminService>;

    beforeEach(() => {
        adminService = {
            listUsers: jest.fn(),
            getUserDetails: jest.fn(),
            changeUserStatus: jest.fn(),
            adminResetPassword: jest.fn(),
        } as any;
        controller = new UsersAdminController(adminService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('listUsers', () => {
        it('should list users with parsed pagination and status', () => {
            adminService.listUsers.mockResolvedValue([] as any);

            const result = controller.listUsers('2', '10', 'ACTIVE');

            expect(adminService.listUsers).toHaveBeenCalledWith(2, 10, 'ACTIVE');
            expect(result).resolves.toEqual([]);
        });

        it('should use default pagination options', () => {
            adminService.listUsers.mockResolvedValue([] as any);
            controller.listUsers(undefined, undefined, undefined);
            expect(adminService.listUsers).toHaveBeenCalledWith(1, 20, undefined);
        });
    });

    describe('getUserDetails', () => {
        it('should get user details', () => {
            adminService.getUserDetails.mockResolvedValue({ id: 'u1' } as any);
            const result = controller.getUserDetails('u1');
            expect(adminService.getUserDetails).toHaveBeenCalledWith('u1');
            expect(result).resolves.toEqual({ id: 'u1' });
        });
    });

    describe('changeUserStatus', () => {
        it('should change user status', () => {
            adminService.changeUserStatus.mockResolvedValue({ status: true } as any);
            const result = controller.changeUserStatus('u1', 'SUSPENDED');
            expect(adminService.changeUserStatus).toHaveBeenCalledWith('u1', 'SUSPENDED');
            expect(result).resolves.toEqual({ status: true });
        });
    });

    describe('adminResetPassword', () => {
        it('should reset password', () => {
            adminService.adminResetPassword.mockResolvedValue({ success: true } as any);
            const result = controller.adminResetPassword('u1', 'newPass');
            expect(adminService.adminResetPassword).toHaveBeenCalledWith('u1', 'newPass');
            expect(result).resolves.toEqual({ success: true });
        });
    });
});
