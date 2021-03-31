using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using API.Helpers;
using API.Interfaces;
using MailKit.Net.Smtp;
using MimeKit;

namespace API.Services
{
    public class EmailSender : IEmailSender
    {
        private readonly EmailConfiguration _emailConfig;
        public EmailSender(EmailConfiguration emailConfig)
        {
            _emailConfig = emailConfig;
        }

        public void SendEmail(EmailMessage email)
        {
            var emailMessage = CreateEmailMessage(email);
            Send(emailMessage);
        }

        public async Task SendEmailAsync(EmailMessage email)
        {
            var emailMessage = CreateEmailMessage(email);
            await SendAsync(emailMessage);
        }

        private MimeMessage CreateEmailMessage(EmailMessage email) {
            var emailMessage = new MimeMessage();
            emailMessage.From.Add(new MailboxAddress(_emailConfig.From));
            emailMessage.To.AddRange(email.To);
            emailMessage.Subject = email.Subject;
            // for plaintext email body
            // emailMessage.Body = new TextPart(MimeKit.Text.TextFormat.Text) { Text = email.Content };
            // for raw html email body
            // emailMessage.Body = new TextPart(MimeKit.Text.TextFormat.Html) { Text = string.Format("<h2 style='color: red;'>{0}</h2>", email.Content) };

            // for adding attachments with html email body
            // var bodyBuilder = new BodyBuilder { HtmlBody = string.Format("<h2 style='color: red;'>{0}</h2>", email.Content) };

            // for sending plaintext body with attachments if we want (plaintext for password reset and email confirmation)
            // var bodyBuilder = new BodyBuilder { TextBody = email.Content };

            // for Email Confirmation and Reset Password emails just use a link
            var bodyBuilder = new BodyBuilder { HtmlBody = string.Format("<h2><a href={0}>Click Here</a></h2>", email.Content) };

            if (email.Attachments != null && email.Attachments.Any())
            {
                byte[] fileBytes;
                foreach (var attachment in email.Attachments)
                {
                    using (var ms = new MemoryStream())
                    {
                        attachment.CopyTo(ms);
                        fileBytes = ms.ToArray();
                    }

                    bodyBuilder.Attachments.Add(attachment.FileName, fileBytes, ContentType.Parse(attachment.ContentType));
                }
            }

            emailMessage.Body = bodyBuilder.ToMessageBody();

            return emailMessage;
        }

        private void Send(MimeMessage mailMessage) {
            using (var client = new SmtpClient())
            {
                try
                {
                    client.Connect(_emailConfig.SmtpServer, _emailConfig.Port, true);
                    client.AuthenticationMechanisms.Remove("XOAUTH2");
                    client.Authenticate(_emailConfig.Username, _emailConfig.Password);

                    client.Send(mailMessage);
                } catch {
                    throw;
                }
                finally
                {
                    client.Disconnect(true);
                    client.Dispose();
                }
            }
        }

        private async Task SendAsync(MimeMessage mailMessage)
        {
            using (var client = new SmtpClient())
            {
                try
                {
                    await client.ConnectAsync(_emailConfig.SmtpServer, _emailConfig.Port, true);
                    client.AuthenticationMechanisms.Remove("XOAUTH2");
                    await client.AuthenticateAsync(_emailConfig.Username, _emailConfig.Password);

                    await client.SendAsync(mailMessage);
                } catch {
                    throw;
                }
                finally
                {
                    await client.DisconnectAsync(true);
                    client.Dispose();
                }
            }
        }
    }
}