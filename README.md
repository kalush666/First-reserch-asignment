
# 🩺 Appointment System – Fullstack Architecture (NestJS + C# TCP Microservice)

This project is a modern backend system for managing doctor-patient appointments. It demonstrates the use of a REST API built with **NestJS (TypeScript)**, communicating with a **C# microservice** over **TCP** to perform advanced load analysis.

---

## 📁 Project Structure

```
appointment-system/
├── backend-nest-js/                # REST API built with NestJS + PostgreSQL (via Prisma)
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── appointments/
│   │   │   ├── dto/
│   │   │   │   ├── appointment.dto.ts
│   │   │   │   └── index.ts
│   │   │   ├── appointments.controller.ts
│   │   │   ├── appointments.module.ts
│   │   │   └── appointments.service.ts
│   │   ├── auth/
│   │   │   ├── decorator/
│   │   │   ├── dto/
│   │   │   │   ├── auth.dto.ts
│   │   │   │   └── index.ts
│   │   │   ├── strategy/
│   │   │   │   ├── index.ts
│   │   │   │   └── jwt.strategy.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.module.ts
│   │   │   └── auth.service.ts
│   │   ├── common/
│   │   │   ├── enums/
│   │   │   │   ├── appointmentstatus.enum.ts
│   │   │   │   └── doctorspeciality.enum.ts
│   │   │   ├── filters/
│   │   │   │   └── http-exception.filter.ts
│   │   │   └── middleware/
│   │   │       └── logger.middleware.ts
│   │   ├── prisma/
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts
│   │   ├── user/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.module.ts
│   │   │   └── user.service.ts
│   │   ├── utils/
│   │   │   └── socket-client.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env
│   ├── docker-compose.yml
│   ├── package.json
│   ├── README.md
│   └── tsconfig.json

├── backend-csharp/                 # Microservice (TCP server) for analyzing appointment load
│   ├── Models/
│   │   ├── Enums/
│   │   │   ├── AppointmentStatus.cs
│   │   │   └── DoctorSpeciality.cs
│   │   ├── Appointment.cs
│   │   ├── Doctor.cs
│   │   ├── Patient.cs
│   │   └── User.cs
│   ├── Services/
│   │   ├── LoadPredicator.cs
│   │   └── TcpRequestHandler.cs
│   ├── Utils/
│   │   └── JsonHandler.cs
│   ├── Program.cs
│   ├── .env
│   └── .gitignore



```

---

## 🚀 How It Works – Flow Summary

### 1. Appointment Creation
- The client calls `POST /appointments` via the NestJS API.
- The request goes to `AppointmentsController -> AppointmentsService`.
- Prisma ORM saves the appointment in **Postgressql**.

### 2. Load Analysis
- The client calls `GET /appointments/analyze-load?type=busy` or `type=free`.
- NestJS queries all upcoming appointments using Prisma.
- It builds a structured payload (`doctor`, `patient`, `date`, `status`, etc.).
- NestJS sends the data to the **C# microservice** via TCP (port **5000**).
- The microservice processes it:
  - For `type=busy`: returns days with high load.
  - For `type=free`: returns available days (not booked).
- The response is returned as JSON to the client.

---

## 🧠 NestJS Overview

### Core Folders
- `appointments/` – Business logic and controller for appointments.
- `auth/` – Handles login, JWT, user role verification.
- `user/` – CRUD for users (patients & doctors).
- `utils/socket-client.ts` – TCP client that sends data to the C# server.

### Features
- ✅ Uses **Prisma** with postgresql
- ✅ Input validation with `class-validator`
- ✅ Auth with JWT and decorators
- ✅ Clean architecture: controller → service → DB

---

## ⚙️ C# TCP Microservice

### File: `TcpRequestHandler.cs`
- Starts TCP server on port **5000**
- Waits for connections from NestJS
- Accepts a JSON string, deserializes it to C# models (`Appointment`, `Doctor`, `Patient`)
- Invokes logic from `LoadPredicator.cs`:
  - `ReturnBusyDays()` – days with more than 10 appointments
  - `ReturnFreeDays()` – available working days without appointments

### Communication Flow:
```
NestJS (Client)        C# (Server)
-----------------     ----------------------
sendToTcpServer()  →  TcpListener.Accept()
                     → Deserialize JSON
                     → Analyze dates
                     → Write response JSON
← Read response     ← Write result
```

---

## 📦 TCP Payload Structure (sent from NestJS)

```json
{
  "type": "busy" | "free",
  "appointments": [
    {
      "doctor": { "id": 1, "name": "Dr. X", "speciality": "Cardiologist" },
      "patient": { "id": 2, "name": "Jane", "allergies": [], "medications": [] },
      "appointmentDateTime": "2025-06-10T10:00:00.000Z",
      "status": "Pending",
      "appointmentReasons": ["Follow-up"]
    }
  ],
  "workingDays": ["2025-06-10", "2025-06-11"]  // Only for type=free
}
```

---

## 🐳 Docker Setup (Postgresql)

`docker-compose.yml`:
```yaml
version: '3.8'

services:
  dev-db:
    image: postgres:15
    restart: always
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: USERNAME
      POSTGRES_PASSWORD: PASSWORD
      POSTGRES_DB: DBNAME
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:

```

---

## 💡 Ports and Communication

| Component       | Port | Purpose                            |
|-----------------|------|------------------------------------|
| NestJS API      | 3000 | Main HTTP server for client calls  |
| postgresql      | 27017| Database for appointments/users    |
| C# TCP server   | 5000 | Internal socket load analysis      |

---

## 📌 Tech Stack

| Layer         | Tech                           |
|---------------|--------------------------------|
| API Backend   | NestJS (TypeScript)            |
| Auth          | JWT + Guards + Decorators      |
| DB Access     | Prisma ORM with Postgresql     |
| Microservice  | C# .NET 5                      |
| Communication | TCP Socket (net + TcpListener) |

---

## 🧪 Test Scenarios

1. **Create Appointment**: POST `/appointments`
2. **Analyze Load**: GET `/appointments/analyze-load?type=busy`
3. **Analyze Free Days**: GET `/appointments/analyze-load?type=free`
4. **Invalid Role**: Trigger guard via custom decorator
5. **TCP Error**: Stop the C# microservice and retry to see timeout

---

## 👨‍💻 Run the System

### Step 1: Start postgresql
```bash
yarn db:dev:up (custom commend look in the package.json) also ensure docker up is open
```

### Step 2: Start NestJS Backend
```bash
cd backend-nest-js
yarn install
yarn start:dev
```

### Step 3: Run C# TCP Microservice
```bash
cd backend-csharp
dotnet run
```

---

## 🤝 Authors & Contributors
- 🧑‍💻 Fullstack Developer: *Jonathan Kalush*

---

## 📎 Notes
- Ensure consistent enums or use strings for cross-platform compatibility.
- Add retry mechanism or timeouts on NestJS TCP client for robustness.

---
