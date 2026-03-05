import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResourceNotFoundException } from '@nestlancer/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as handlebars from 'handlebars';

@Injectable()
export class EmailRendererService {
    private readonly logger = new Logger(EmailRendererService.name);
    private templates: Map<string, handlebars.TemplateDelegate> = new Map();
    private baseLayout?: handlebars.TemplateDelegate;

    constructor(private readonly configService: ConfigService) { }

    async onModuleInit() {
        await this.loadTemplates();
    }

    private async loadTemplates() {
        const templatesPath = this.configService.get<string>('email-worker.templatesPath');
        if (!templatesPath) {
            this.logger.warn('Templates path not configured');
            return;
        }

        // Load layout separately
        try {
            const layoutPath = path.join(templatesPath, 'layouts', 'base.hbs');
            const layoutContent = await fs.readFile(layoutPath, 'utf8');
            this.baseLayout = handlebars.compile(layoutContent);
            this.logger.log('Loaded base email layout');
        } catch (error: any) {
            this.logger.error(`Failed to load base layout from ${templatesPath}/layouts/base.hbs: ${error.message}`);
        }

        // Load templates
        try {
            const files = await fs.readdir(templatesPath);
            for (const file of files) {
                if (file.endsWith('.hbs')) {
                    const templateName = path.basename(file, '.hbs');
                    try {
                        const content = await fs.readFile(path.join(templatesPath, file), 'utf8');
                        this.templates.set(templateName, handlebars.compile(content));
                    } catch (err: any) {
                        this.logger.error(`Failed to load template ${file}: ${err.message}`);
                    }
                }
            }
            this.logger.log(`Loaded ${this.templates.size} email templates`);
        } catch (error: any) {
            this.logger.error(`Failed to read templates directory ${templatesPath}: ${error.message}`);
        }
    }

    async render(templateName: string, data: any): Promise<string> {
        const template = this.templates.get(templateName);
        if (!template) {
            throw new ResourceNotFoundException('EmailTemplate', templateName);
        }

        const body = template(data);
        if (this.baseLayout) {
            return this.baseLayout({ ...data, body });
        }

        return body;
    }
}
