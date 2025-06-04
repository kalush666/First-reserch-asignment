namespace backend_csharp.Models
{
    public abstract class User
    {
        private int Id { get; set; }
        private string Name { get; set; }
        private decimal Age { get; set; }

        public User(int id,string name,decimal age)
        {
            this.Id = id;
            this.Name = name;
            this.Age = age;
        }

        public virtual string ToString()
        {
            return $"Id:{Id} Name:{Name} Age:{Age}";
        }
    }
}
