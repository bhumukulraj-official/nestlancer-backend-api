import { Controller, Post, Body, Ip, Get } from '@nestjs/common';
import { Public, Idempotent } from '@nestlancer/common';
import { SubmitContactDto } from '../../dto/submit-contact.dto';
import { ContactSubmissionService } from '../../services/contact-submission.service';

@Controller('contact')
export class ContactPublicController {
    constructor(private readonly submissionService: ContactSubmissionService) { }

    @Public()
    @Get('health')
    healthCheck() {
        return { status: 'healthy', service: 'contact' };
    }

    @Public()
    @Idempotent()
    @Post()
    async submitContact(
        @Body() dto: SubmitContactDto,
        @Ip() ip: string,
    ) {
        const result = await this.submissionService.submit(dto, ip);
        return {
            message: "Your message has been received. We'll be in touch soon.",
            data: result,
        };
    }
}
