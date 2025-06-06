import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  signin(dto: AuthDto) {
    return '';
  }

  async signup(dto: AuthDto) {
    try {
      const hash = await argon.hash(dto.password);

      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash,
          name: dto.name,
          age: dto.age,
          role: dto.role,
          speciality: dto.role === UserRole.DOCTOR ? dto.speciality : null,
          allergies: dto.role === UserRole.PATIENT ? dto.allergies || [] : [],
          medications:
            dto.role === UserRole.PATIENT ? dto.medications || [] : [],
        },
        select: {
          id: true,
          email: true,
          name: true,
          age: true,
          role: true,
          speciality: true,
          allergies: true,
          medications: true,
        },
      });

      return {
        message: 'User created successfully',
        user,
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }
}
