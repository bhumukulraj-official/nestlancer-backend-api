import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResourceNotFoundException } from '@nestlancer/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as handlebars from 'handlebars';

/**
 * Service responsible for rendering email templates using Handlebars.
 * Manages template loading from the filesystem and layout composition.
 */
@Injectable()
export class EmailRendererService {
  private readonly logger = new Logger(EmailRendererService.name);
  private templates: Map<string, handlebars.TemplateDelegate> = new Map();
  private baseLayout?: handlebars.TemplateDelegate;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Initializes the service by loading all available templates into memory.
   */
  async onModuleInit(): Promise<void> {
    await this.loadTemplates();
  }

  /**
   * Scans the template directory and compiles Handlebars templates.
   * Also loads the primary base layout if present.
   */
  private async loadTemplates(): Promise<void> {
    const templatesPath =
      process.env.TEMPLATES_PATH ||
      this.configService.get<string>('emailWorker.templatesPath') ||
      './src/templates';
    if (!templatesPath) {
      this.logger.warn('[EmailRenderer] Templates path not configured, email delivery may fail.');
      return;
    }

    // Load base layout
    try {
      const layoutPath = path.join(templatesPath, 'layouts', 'base.hbs');
      const layoutContent = await fs.readFile(layoutPath, 'utf8');
      this.baseLayout = handlebars.compile(layoutContent);
      this.logger.log('[EmailRenderer] Successfully compiled base email layout.');
    } catch (error: any) {
      this.logger.error(`[EmailRenderer] Critical: Failed to load base layout: ${error.message}`);
    }

    // Load individual templates
    try {
      const files = await fs.readdir(templatesPath);
      for (const file of files) {
        if (file.endsWith('.hbs')) {
          const templateName = path.basename(file, '.hbs');
          try {
            const content = await fs.readFile(path.join(templatesPath, file), 'utf8');
            this.templates.set(templateName, handlebars.compile(content));
          } catch (err: any) {
            this.logger.error(`[EmailRenderer] Failed to compile template ${file}: ${err.message}`);
          }
        }
      }
      this.logger.log(
        `[EmailRenderer] Initialization complete. Loaded ${this.templates.size} distinct templates.`,
      );
    } catch (error: any) {
      this.logger.error(`[EmailRenderer] Failed to read templates directory: ${error.message}`);
    }
  }

  /**
   * Renders a specific email template with provided data.
   *
   * @param templateName - The filename of the template (without .hbs extension)
   * @param data - The contextual data to inject into the template
   * @returns A promise resolving to the final HTML string
   * @throws ResourceNotFoundException if the specified template is not loaded
   */
  async render(templateName: string, data: any): Promise<string> {
    const template = this.templates.get(templateName);
    if (!template) {
      this.logger.error(`[EmailRenderer] Requested template not found: ${templateName}`);
      throw new ResourceNotFoundException('EmailTemplate', templateName);
    }

    const body = template(data);
    if (this.baseLayout) {
      return this.baseLayout({ ...data, body });
    }

    return body;
  }
}
