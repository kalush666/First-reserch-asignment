using System;
using System.Collections.Generic;

namespace backend_csharp.Models
{
    public class Appointment
    {
        public Doctor Doctor { get; set; }
        public Patient Patient { get; set; }
        public DateTime AppointmentDateTime { get; set; }

        public List<string> AppointmentReasons { get; set; }
        public Appointment(Doctor doctor, Patient patient,DateTime appointmentDateTime,List<string> appointmentReasons) {
            this.Doctor = doctor;
            this.Patient = patient;
            this.AppointmentDateTime = appointmentDateTime;
            this.AppointmentReasons = appointmentReasons;
        }
    }
}
