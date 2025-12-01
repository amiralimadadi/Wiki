
namespace Kms.Application.ViewModels
{
    public class UnitViewModel
    {
        public int ID { get; set; }
        public string? UnitName { get; set; }

    }

    public class UnitResponsibleViewModel
    {
        public int UserId { get; set; }

        public int UnitId { get; set; }

    }
}
