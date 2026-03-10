import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { HttpExceptionFilter } from '@nestlancer/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    app.enableCors({
        origin: configService.get('CORS_ORIGIN') || '*',
        credentials: true,
    });

    app.setGlobalPrefix('api');
    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    );

    app.useGlobalFilters(new HttpExceptionFilter());

    const swaggerConfig = new DocumentBuilder()
        .setTitle('Nestlancer Blog Service')
        .setDescription('Blog management API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig));

    const port = configService.get<number>('BLOG_SERVICE_PORT') || 3014;
    await app.listen(port);
    console.log(`Blog service is running on: ${await app.getUrl()}`);
}
bootstrap();
