import { AppointmentStatus } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsInt()
  doctorId: number;

  @IsInt()
  patientId: number;

  @IsDateString()
  appointmentDate: string;

  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;

  @IsArray()
  @IsNotEmpty()
  appointmentReasons: string[];
}

export class FindAppountmetDto {
  @IsOptional()
  @IsInt()
  doctorId?: number;

  @IsOptional()
  @IsInt()
  patientId?: number;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}
