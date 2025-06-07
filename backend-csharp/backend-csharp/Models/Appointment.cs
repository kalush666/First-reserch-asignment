using System;
using System.Collections.Generic;

namespace backend_csharp.Models
{
    public class Appointment
    {
        public Doctor Doctor { get; set; }
        public Patient Patient { get; set; }
        public DateTime AppointmentDateTime { get; set; }
        public string Status { get; set; }
        public List<string> AppointmentReasons { get; set; }

        public Appointment()
        {
            Doctor = new Doctor();
            Patient = new Patient();
            AppointmentDateTime = DateTime.Now;
            Status = "Pending";
            AppointmentReasons = new List<string>();
        }

        public Appointment(Doctor doctor, Patient patient, DateTime appointmentDateTime, List<string> appointmentReasons)
        {
            Doctor = doctor;
            Patient = patient;
            AppointmentDateTime = appointmentDateTime;
            Status = "Pending";
            AppointmentReasons = appointmentReasons;
        }

        public override string ToString()
        {
            return $"Doctor: {Doctor}, Patient: {Patient}, Date: {AppointmentDateTime}, Status: {Status}";
        }
    }
}
