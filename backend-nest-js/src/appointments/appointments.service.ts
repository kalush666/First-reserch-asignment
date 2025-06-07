import { Injectable, Post } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AppointmentsService {
  constructor(prisma: PrismaService) {}

  @Post('create')
  async createAppointment() {}
}
