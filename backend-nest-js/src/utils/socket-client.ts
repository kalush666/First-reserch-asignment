import { CreateAppointmentDto } from 'src/appointments/dto';
import * as net from 'net';

export interface AppointmentRequest {
  type: 'busy' | 'free';
  appointments: {
    doctor: {
      id: number;
      name: string;
      speciality: string;
    };
    patient: {
      id: number;
      name: string;
      allergies: string[];
      medications: string[];
    };
    appointmentDateTime: Date;
    status: string;
    appointmentReasons: string[];
  }[];
  workingDays?: string[];
}

export async function sendToTcpServer(
  payload: AppointmentRequest,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    const PORT = 5000;
    const HOST = '127.0.0.1';

    client.connect(PORT, HOST, () => {
      const json = JSON.stringify(payload);
      client.write(json);
      client.end();
    });

    let response = '';

    client.on('data', (data) => {
      response += data.toString();
    });

    client.on('end', () => {
      resolve(response);
    });

    client.on('error', (err) => {
      reject(err);
    });
  });
}
