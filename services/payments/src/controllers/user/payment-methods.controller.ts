import { Controller, Post, Get, Delete, Patch, Body, Param } from '@nestjs/common';
import { Auth, CurrentUser } from '@nestlancer/auth-lib';
import { PaymentMethodsService } from '../../services/payment-methods.service';
import { AddPaymentMethodDto } from '../../dto/add-payment-method.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Payment Methods')
@ApiBearerAuth()
@Auth()
@Controller('payments/methods')
export class PaymentMethodsController {
    constructor(private readonly paymentMethodsService: PaymentMethodsService) { }

    @Get()
    @ApiOperation({ summary: 'List saved payment methods' })
    async getMethods(@CurrentUser('userId') userId: string) {
        const data = await this.paymentMethodsService.getSavedMethods(userId);
        return { status: 'success', data };
    }

    @Post()
    @ApiOperation({ summary: 'Add a new payment method' })
    async addMethod(
        @CurrentUser('userId') userId: string,
        @Body() dto: AddPaymentMethodDto,
    ) {
        const result = await this.paymentMethodsService.addMethod(userId, dto);
        return { status: 'success', data: result };
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Remove a payment method' })
    async removeMethod(
        @CurrentUser('userId') userId: string,
        @Param('id') methodId: string,
    ) {
        await this.paymentMethodsService.removeMethod(userId, methodId);
        return { status: 'success' };
    }

    @Patch(':id/default')
    @ApiOperation({ summary: 'Set a payment method as default' })
    async setDefault(
        @CurrentUser('userId') userId: string,
        @Param('id') methodId: string,
    ) {
        const result = await this.paymentMethodsService.setDefaultMethod(userId, methodId);
        return { status: 'success', data: result };
    }

    @Patch(':id/nickname')
    @ApiOperation({ summary: 'Update payment method nickname' })
    async updateNickname(
        @CurrentUser('userId') userId: string,
        @Param('id') methodId: string,
        @Body('nickname') nickname: string,
    ) {
        const result = await this.paymentMethodsService.updateNickname(userId, methodId, nickname);
        return { status: 'success', data: result };
    }
}
