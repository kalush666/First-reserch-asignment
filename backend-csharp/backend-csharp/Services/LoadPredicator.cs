using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend_csharp.Models;

namespace backend_csharp.Services
{
    public class LoadPredicator
    {
        public event EventHandler? HighLoadDetection;
        public event EventHandler? FreeDaysDetection;

        public async Task<List<DateTime>> ReturnBusyDays(List<Appointment> appointments)
        {
            return await Task.Run(() =>
            {
                var busyDays = appointments
                    .GroupBy(a => a.AppointmentDateTime.Date)
                    .Where(group => group.Count() > 10)
                    .Select(group => group.Key)
                    .ToList();

                if (busyDays.Any())
                {
                    HighLoadDetection?.Invoke(this, EventArgs.Empty);
                }

                return busyDays;
            });
        }

        public async Task<List<DateTime>> ReturnFreeDays(List<Appointment> appointments, List<DateTime> workingDays)
        {
            return await Task.Run(() =>
            {
                var appointmentDates = appointments
                    .Select(a => a.AppointmentDateTime.Date)
                    .Distinct()
                    .ToHashSet();

                var freeDays = workingDays
                    .Select(d => d.Date)
                    .Where(day => !appointmentDates.Contains(day))
                    .ToList();

                if (freeDays.Any())
                {
                    FreeDaysDetection?.Invoke(this, EventArgs.Empty);
                }

                return freeDays;
            });
        }
    }
}
