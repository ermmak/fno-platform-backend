# FNO Platform Backend

Backend service for simplifying the submission of FNO RK (Tax Reporting Forms for the Republic of Kazakhstan).

## About

This platform aims to streamline the process of preparing, validating, and submitting tax reports required by Kazakhstan's tax authorities. It serves businesses and individuals who need to comply with tax reporting requirements in Kazakhstan.

### Features (Planned)

- Tax form processing and validation
- Automated form submission
- Compliance checking against current tax regulations

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) v11
- **Language**: TypeScript
- **Runtime**: Node.js
- **Database**: PostgreSQL with [Prisma](https://www.prisma.io/) ORM
- **Message Broker**: Apache Kafka

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Apache Kafka (optional for development)

## Project Setup

```bash
# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Run database migrations (once PostgreSQL is running)
npx prisma migrate dev
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | HTTP server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `KAFKA_BROKERS` | Kafka broker addresses | `localhost:9092` |
| `KAFKA_CLIENT_ID` | Kafka client identifier | `fno-platform` |
| `KAFKA_CONSUMER_GROUP_ID` | Kafka consumer group | `fno-consumer-group` |

## Running the Application

```bash
# development
npm run start

# watch mode (recommended for development)
npm run start:dev

# production mode
npm run start:prod
```

## Database Commands

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create and apply migrations
npx prisma migrate dev

# Apply migrations in production
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio
```

## Running Tests

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Project Structure

```
src/
├── main.ts                 # Application entry point
├── app.module.ts           # Root module
├── app.controller.ts       # Root controller
├── app.service.ts          # Root service
├── prisma/                 # Database module
│   ├── prisma.module.ts
│   └── prisma.service.ts
└── kafka/                  # Message broker module
    └── kafka.module.ts

prisma/
├── schema.prisma           # Database schema
└── migrations/             # Database migrations

test/
└── app.e2e-spec.ts         # End-to-end tests
```

## Related Projects

- **Frontend**: Next.js application (separate repository)

## License

UNLICENSED - Proprietary
