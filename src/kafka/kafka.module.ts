import { DynamicModule, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const KAFKA_SERVICE = 'KAFKA_SERVICE';

@Module({})
export class KafkaModule {
  static register(): DynamicModule {
    return {
      module: KafkaModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name: KAFKA_SERVICE,
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
              transport: Transport.KAFKA,
              options: {
                client: {
                  clientId:
                    configService.get<string>('KAFKA_CLIENT_ID') ??
                    'fno-platform',
                  brokers: (
                    configService.get<string>('KAFKA_BROKERS') ??
                    'localhost:9092'
                  ).split(','),
                },
                consumer: {
                  groupId:
                    configService.get<string>('KAFKA_CONSUMER_GROUP_ID') ??
                    'fno-consumer-group',
                },
              },
            }),
            inject: [ConfigService],
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
