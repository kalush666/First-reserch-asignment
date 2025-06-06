import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
} from 'class-validator';
import { UserRole, DoctorSpeciality } from '@prisma/client';

export class AuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  age: number;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @IsEnum(DoctorSpeciality)
  @IsOptional()
  speciality?: DoctorSpeciality;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allergies?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  medications?: string[];
}
