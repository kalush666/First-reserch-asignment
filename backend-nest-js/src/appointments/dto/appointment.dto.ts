import { AppointmentStatus } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsInt()
  @IsNotEmpty()
  doctorId: number;

  @IsInt()
  @IsNotEmpty()
  patientId: number;

  @IsDateString()
  @IsNotEmpty()
  appointmentDateTime: string;

  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  appointmentReasons?: string[];
}

export class FindAppointmentDto {
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

export class UpdateAppointmentStatusDto {
  @IsEnum(AppointmentStatus)
  @IsNotEmpty()
  status: AppointmentStatus;
}
