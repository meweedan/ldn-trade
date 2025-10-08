// backend/src/utils/mailer.ts
import nodemailer from 'nodemailer';

export const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,           // e.g. smtp.gmail.com (or your provider)
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,                         // true if 465
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
});

export async function sendMail(opts: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  fromName?: string;
  fromEmail?: string;
}) {
  const from = opts.fromName && opts.fromEmail
    ? `"${opts.fromName}" <${opts.fromEmail}>`
    : process.env.MAIL_FROM || `Support <no-reply@yourdomain.com>`;

  return mailer.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });
}
