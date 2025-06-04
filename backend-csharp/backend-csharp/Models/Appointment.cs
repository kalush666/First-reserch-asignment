using System;
using System.Collections.Generic;

namespace backend_csharp.Models
{
    public class Appointment
    {
        private Doctor Doctor { get; set; }
        private Patient Patient { get; set; }
        private DateTime AppointmentDateTime { get; set; }

        private List<string> AppointmentReasons { get; set; }
        public Appointment(Doctor doctor, Patient patient,DateTime appointmentDateTime,List<string> appointmentReasons) {
            this.Doctor = doctor;
            this.Patient = patient;
            this.AppointmentDateTime = appointmentDateTime;
            this.AppointmentReasons = appointmentReasons;
        }
    }
}
