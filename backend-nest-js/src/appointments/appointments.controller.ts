import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentStatusDto } from './dto';
import { GetUser } from '../auth/decorator';
import { sendToTcpServer } from 'src/utils/socket-client';

@Controller('appointments')
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createAppointment(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.createAppointment(dto);
  }

  @Get('by-patient')
  getAppointmentsByPatient(@Query('id', ParseIntPipe) patientId: number) {
    return this.appointmentsService.getAppointmentsByPatient(patientId);
  }

  @Get('by-doctor')
  getAppointmentsByDoctor(@Query('id', ParseIntPipe) doctorId: number) {
    return this.appointmentsService.getAppointmentsByDoctor(doctorId);
  }

  @Get('my-appointments')
  getMyAppointments(@GetUser() user: any) {
    if (user.role === 'PATIENT') {
      return this.appointmentsService.getAppointmentsByPatient(user.id);
    } else if (user.role === 'DOCTOR') {
      return this.appointmentsService.getAppointmentsByDoctor(user.id);
    }
    return [];
  }

  @Put('update-status')
  updateAppointmentStatus(
    @Query('id', ParseIntPipe) appointmentId: number,
    @Body() dto: UpdateAppointmentStatusDto,
  ) {
    return this.appointmentsService.updateAppointmentStatus(
      appointmentId,
      dto.status,
    );
  }

  @Post('analyze-load')
  @HttpCode(HttpStatus.OK)
  analyzeLoad(@Body() dto: { type: 'busy' | 'free' }) {
    return this.appointmentsService.analyzeLoad(dto.type);
  }
}
