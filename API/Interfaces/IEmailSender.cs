using System.Threading.Tasks;
using API.Helpers;

namespace API.Interfaces
{
    public interface IEmailSender
    {
        void SendEmail(EmailMessage email);
        Task SendEmailAsync(EmailMessage email);
    }
}