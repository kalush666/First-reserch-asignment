import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: 'mongodb://root:jonathan06@localhost:27017/firstP?authSource=admin&retryWrites=true&w=majority',
        },
      },
    });
  }
}
