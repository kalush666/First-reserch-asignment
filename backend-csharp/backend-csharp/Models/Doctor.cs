namespace backend_csharp.Models
{
    public class Doctor : User
    {
        public string Speciality { get; set; }

        public Doctor() : base(0, "", 0)
        {
            Speciality = "Unknown";
        }

        public Doctor(int id, string name, decimal age, string speciality)
            : base(id, name, age)
        {
            Speciality = speciality;
        }

        public override string ToString()
        {
            return base.ToString() + $" | Speciality: {Speciality}";
        }
    }
}
