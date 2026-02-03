import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS for frontend
  app.enableCors({
    origin: [
      'http://localhost:3001', // Next.js dev server
      // Add production frontend URL here
    ],
    credentials: true,
  });

  // Connect Kafka microservice (hybrid mode)
  const kafkaBrokers = configService.get<string>('KAFKA_BROKERS');
  if (kafkaBrokers) {
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId:
            configService.get<string>('KAFKA_CLIENT_ID') ?? 'fno-platform',
          brokers: kafkaBrokers.split(','),
        },
        consumer: {
          groupId:
            configService.get<string>('KAFKA_CONSUMER_GROUP_ID') ??
            'fno-consumer-group',
        },
      },
    });

    // Start microservices (non-blocking if Kafka is unavailable in dev)
    await app.startAllMicroservices().catch((err) => {
      console.warn(
        'Kafka connection failed, running without Kafka:',
        err.message,
      );
    });
  }

  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
