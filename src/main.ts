import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

const PORT = process.env.PORT || 8080;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // * middlewares
  app.enableCors();
  app.setGlobalPrefix('api', {
    exclude: ['/', '/docs'],
  });
  app.useGlobalPipes(new ValidationPipe());

  // * swagger config
  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('ShareBook API')
    .setDescription('ShareBook api documentation')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(PORT);
}
bootstrap();
