import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentMethodsService {
    // A simplified mock service for payment methods
    async getSavedMethods(userId: string) {
        return [];
    }

    async addMethod(userId: string, data: any) {
        return { id: 'pm_dummy', userId, ...data };
    }

    async removeMethod(userId: string, methodId: string) {
        return { success: true };
    }
}
