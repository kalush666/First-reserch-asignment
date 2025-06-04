using backend_csharp.Models.Enums;

namespace backend_csharp.Models
{
    public class Doctor : User
    {
        public DoctorSpeciality Speciality { get; set; }

        public Doctor(int id, string name, decimal age, DoctorSpeciality speciality)
            : base(id, name, age) {
            this.Speciality = speciality;
        }

        public override string ToString()
        {
            return base.ToString() + $"Speciality {Speciality}";
        }
    }
}
