using System;
using System.Collections.Generic;

namespace backend_csharp.Models
{
    public class Patient : User
    {
        public List<string> Allergies { get; set; } = new();
        public List<string> Medications { get; set; } = new();

        public Patient() : base(0, "", 0)
        {
            Allergies = new List<string>();
            Medications = new List<string>();
        }

        public Patient(int id, string name, decimal age, List<string> allergies, List<string> medications)
            : base(id, name, age)
        {
            Allergies = allergies;
            Medications = medications;
        }

        public Patient(int id, string name, decimal age)
            : base(id, name, age)
        {
        }

        public override string ToString()
        {
            string allergies = string.Join(", ", Allergies);
            string medications = string.Join(", ", Medications);

            return base.ToString() + $" | Allergies: [{allergies}] | Medications: [{medications}]";
        }
    }
}
