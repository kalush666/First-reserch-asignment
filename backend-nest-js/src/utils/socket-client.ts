import { CreateAppointmentDto } from 'src/appointments/dto';
import * as net from 'net';

export interface AppointmentRequest {
  type: 'busy' | 'available';
  appointments: CreateAppointmentDto[];
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
