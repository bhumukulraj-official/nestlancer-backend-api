import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
    });

    app.setGlobalPrefix('api');

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    );

    const config = new DocumentBuilder()
        .setTitle('Nestlancer Messaging Service')
        .setDescription('The Nestlancer Messaging Service API description')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app as any, config);
    SwaggerModule.setup('docs', app as any, document);

    app.enableCors();

    const port = process.env.MESSAGING_SERVICE_PORT || 3010; // Messaging service port
    await app.listen(port);
    console.log(`Messaging service listening on port ${port}`);
}

bootstrap();
