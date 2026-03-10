import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import type { Request, Response, NextFunction } from 'express';
import { getServiceSpecsForSwaggerUi } from './swagger/swagger.config';
import { HealthModule } from './modules/health/health.module';
import { SwaggerDocsModule } from './swagger/swagger.module';
import {
  AppValidationPipe,
  AllExceptionsFilter,
  TransformResponseInterceptor,
  LoggingInterceptor,
  TimeoutInterceptor,
  API_PREFIX,
  API_VERSION,
  DEFAULT_GATEWAY_PORT,
  MAX_PAYLOAD_SIZE,
} from '@nestlancer/common';
import { getCorsConfig, getHelmetConfig } from '@nestlancer/middleware';
import helmet from 'helmet';
import compression from 'compression';

/**
 * Bootstrap the Nestlancer API Gateway
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    bodyParser: true,
  });

  // Trust proxy (for getting real client IP behind load balancer)
  app.getHttpAdapter().getInstance().set('trust proxy', true);

  // Compression middleware
  app.use(compression());

  // Security (skip helmet for /docs, docs-specs, docs-gateway-json so Swagger UI works on http://)
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.includes('/docs') || req.path.includes('docs-specs')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      return next();
    }
    helmet(getHelmetConfig())(req, res, next);
  });
  app.enableCors(getCorsConfig(process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000']));

  // Global prefix
  app.setGlobalPrefix(`${API_PREFIX}/${API_VERSION}`);

  // Global pipes, filters, interceptors
  app.useGlobalPipes(new AppValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformResponseInterceptor(),
    new TimeoutInterceptor(),
  );

  // Swagger/OpenAPI documentation – dropdown per microservice
  const gatewayBase = `/${API_PREFIX}/${API_VERSION}`;
  const specUrls = getServiceSpecsForSwaggerUi(gatewayBase);

  const config = new DocumentBuilder()
    .setTitle('Nestlancer API')
    .setDescription('Select a microservice from the dropdown to view its API documentation')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();

  const document = SwaggerModule.createDocument(app as any, config);

  // Gateway-only spec: health + docs-specs (excludes proxy routes shown in other services)
  const gatewayOnlyConfig = new DocumentBuilder()
    .setTitle('Nestlancer Gateway')
    .setDescription('Gateway-specific endpoints: health checks and API documentation specs')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();
  const gatewayDocument = SwaggerModule.createDocument(app as any, gatewayOnlyConfig, {
    include: [HealthModule, SwaggerDocsModule],
  });

  const httpAdapter = app.getHttpAdapter();

  // Serve Gateway-only spec at /docs-gateway-json for the dropdown
  httpAdapter.get('/docs-gateway-json', (_req: any, res: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.json(gatewayDocument);
  });

  // Register custom /docs BEFORE setup so it takes precedence (NestJS default passes spec which hides dropdown)
  const urlsJson = JSON.stringify(specUrls);
  const primaryName = specUrls[0]?.name ?? 'Gateway';
  httpAdapter.get('/docs', (_req: any, res: any) => {
    res.type('text/html');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Nestlancer API – Microservices Docs</title>
  <link rel="stylesheet" type="text/css" href="./swagger-ui.css">
  <link rel="icon" type="image/png" href="./favicon-32x32.png" sizes="32x32">
  <link rel="icon" type="image/png" href="./favicon-16x16.png" sizes="16x16">
  <style>html{box-sizing:border-box;overflow-y:scroll}*,*:before,*:after{box-sizing:inherit}body{margin:0;background:#fafafa}</style>
</head>
<body>
<div id="swagger-ui"></div>
<script src="./swagger-ui-bundle.js"></script>
<script src="./swagger-ui-standalone-preset.js"></script>
<script>
window.onload=function(){SwaggerUIBundle({urls:${urlsJson},"urls.primaryName":"${primaryName}",dom_id:"#swagger-ui",deepLinking:!0,presets:[SwaggerUIBundle.presets.apis,SwaggerUIStandalonePreset],layout:"StandaloneLayout"})};
</script>
</body>
</html>`);
  });
  httpAdapter.get('/docs/', (_req: any, res: any) => {
    res.redirect(301, '/docs');
  });

  SwaggerModule.setup('docs', app as any, document, {
    customSiteTitle: 'Nestlancer API – Microservices Docs',
  });

  // Graceful shutdown
  app.enableShutdownHooks();

  const port = process.env.GATEWAY_PORT || DEFAULT_GATEWAY_PORT;
  await app.listen(port);

  console.log(`🚀 Nestlancer API Gateway running on http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/docs`);
  console.log(`🔒 API Base URL: http://localhost:${port}/${API_PREFIX}/${API_VERSION}`);
}

bootstrap();
