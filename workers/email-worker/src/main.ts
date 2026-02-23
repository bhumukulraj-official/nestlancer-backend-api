import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);

    // Enable graceful shutdown
    app.enableShutdownHooks();

    console.log('Email Worker is running...');
}
bootstrap();
