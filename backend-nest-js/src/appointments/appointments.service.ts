import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAppointmentDto } from './dto';
import { UserRole, AppointmentStatus } from '@prisma/client';
import { sendToTcpServer } from 'src/utils/socket-client';

import { DoctorSpeciality } from 'src/common/enums/doctorspeciality.enum';
@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async createAppointment(dto: CreateAppointmentDto) {
    const { patientId, doctorId, appointmentDateTime, appointmentReasons } =
      dto;

    const patient = await this.prisma.user.findUnique({
      where: { id: patientId },
      include: { patient: true },
    });

    if (!patient || patient.role !== UserRole.PATIENT) {
      throw new NotFoundException('Patient does not exist');
    }

    const doctor = await this.prisma.user.findUnique({
      where: { id: doctorId },
      include: { doctor: true },
    });

    if (!doctor || doctor.role !== UserRole.DOCTOR) {
      throw new NotFoundException('Doctor does not exist');
    }

    if (new Date(appointmentDateTime) <= new Date()) {
      throw new BadRequestException('Appointment date must be in the future');
    }

    const existingAppointment = await this.prisma.appointment.findFirst({
      where: {
        OR: [
          { doctorId, appointmentDateTime },
          { patientId, appointmentDateTime },
        ],
      },
    });

    if (existingAppointment) {
      throw new ConflictException(
        'An appointment already exists at this time for either the doctor or patient',
      );
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        doctorId,
        patientId,
        appointmentDateTime: new Date(appointmentDateTime),
        appointmentReasons: appointmentReasons || [],
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            doctor: {
              select: {
                speciality: true,
              },
            },
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      message: 'Appointment created successfully',
      appointment,
    };
  }

  async getAppointmentsByPatient(patientId: number) {
    const appointments = await this.prisma.appointment.findMany({
      where: { patientId },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            doctor: {
              select: {
                speciality: true,
              },
            },
          },
        },
      },
      orderBy: {
        appointmentDateTime: 'asc',
      },
    });

    return appointments;
  }

  async getAppointmentsByDoctor(doctorId: number) {
    const appointments = await this.prisma.appointment.findMany({
      where: { doctorId },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            age: true,
            patient: {
              select: {
                allergies: true,
                medications: true,
              },
            },
          },
        },
      },
      orderBy: {
        appointmentDateTime: 'asc',
      },
    });

    return appointments;
  }

  async updateAppointmentStatus(appointmentId: number, status: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (
      !Object.values(AppointmentStatus).includes(status as AppointmentStatus)
    ) {
      throw new BadRequestException('Invalid appointment status');
    }

    const updatedAppointment = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: status as AppointmentStatus },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            doctor: {
              select: {
                speciality: true,
              },
            },
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      message: 'Appointment status updated successfully',
      appointment: updatedAppointment,
    };
  }

  async analyzeLoad(type: 'busy' | 'free') {
    const appointments = await this.prisma.appointment.findMany({
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            age: true,
            doctor: { select: { speciality: true } },
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            age: true,
            patient: { select: { allergies: true, medications: true } },
          },
        },
      },
    });

    const workingDays =
      type === 'free' ? this.getUpcomingWorkingDays() : undefined;

    const payload = {
      type,
      appointments: appointments.map((a) => ({
        doctor: {
          id: a.doctor.id,
          name: a.doctor.name,
          age: a.doctor.age,
          speciality:
            (a.doctor.doctor?.speciality as DoctorSpeciality) ?? 'Unknown',
        },
        patient: {
          id: a.patient.id,
          name: a.patient.name,
          age: a.patient.age,
          allergies: a.patient.patient?.allergies ?? [],
          medications: a.patient.patient?.medications ?? [],
        },
        appointmentDateTime: a.appointmentDateTime,
        status: a.status,
        appointmentReasons: a.appointmentReasons,
      })),
      workingDays,
    };

    const result = await sendToTcpServer(payload);
    return JSON.parse(result);
  }

  private getUpcomingWorkingDays(): string[] {
    const today = new Date();
    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        days.push(d.toISOString().split('T')[0]);
      }
    }
    return days;
  }
}
