import nodemailer from "nodemailer";

let transporter = null;

const buildTransporter = () => {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 465,
    secure: (process.env.SMTP_SECURE ?? "true") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
};

const baseTemplate = ({ title, body, accent = "#2563eb" }) => `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
    <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
      <div style="background:${accent};padding:24px 28px;color:#fff;">
        <div style="font-size:22px;font-weight:700;letter-spacing:-0.5px;">💊 MedSedule</div>
        <div style="opacity:0.9;margin-top:4px;">${title}</div>
      </div>
      <div style="padding:28px;color:#0f172a;line-height:1.6;font-size:15px;">
        ${body}
      </div>
      <div style="padding:16px 28px;background:#f8fafc;color:#64748b;font-size:12px;">
        You are receiving this reminder from MedSedule.
        Manage your medicines at <a href="${process.env.CLIENT_URL}" style="color:${accent};">${process.env.CLIENT_URL}</a>.
      </div>
    </div>
  </body>
</html>
`;

export const sendReminderEmail = async ({ to, userName, medicine, schedule }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("⚠️  SMTP not configured — skipping email send.");
    return { skipped: true };
  }
  const t = buildTransporter();
  const html = baseTemplate({
    title: `Time to take ${medicine.name}`,
    body: `
      <p>Hi <strong>${userName || "there"}</strong>,</p>
      <p>This is your reminder for <strong>${medicine.name}</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px 0;color:#64748b;">Dosage</td><td style="padding:8px 0;font-weight:600;">${medicine.dosage}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Time</td><td style="padding:8px 0;font-weight:600;">${schedule.time}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Frequency</td><td style="padding:8px 0;font-weight:600;text-transform:capitalize;">${schedule.frequency}</td></tr>
        ${medicine.notes ? `<tr><td style="padding:8px 0;color:#64748b;">Notes</td><td style="padding:8px 0;">${medicine.notes}</td></tr>` : ""}
      </table>
      <p style="margin-top:24px;">
        <a href="${process.env.CLIENT_URL}/dashboard" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:600;">Mark as taken</a>
      </p>
      <p style="color:#64748b;font-size:13px;margin-top:24px;">
        Stay healthy! 💙
      </p>
    `,
  });
  return t.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || "MedSedule"}" <${process.env.SMTP_USER}>`,
    to,
    subject: `⏰ Reminder: ${medicine.name} at ${schedule.time}`,
    html,
  });
};

export const sendWelcomeEmail = async ({ to, name }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return { skipped: true };
  const t = buildTransporter();
  const html = baseTemplate({
    title: "Welcome to MedSedule",
    body: `
      <p>Hi <strong>${name}</strong>,</p>
      <p>Welcome to MedSedule! Your account is ready.</p>
      <p>Add your first medicine and we'll handle the reminders — by email, browser notification, and more.</p>
      <p style="margin-top:24px;">
        <a href="${process.env.CLIENT_URL}/add-medicine" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:600;">Add a medicine</a>
      </p>
    `,
  });
  return t.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || "MedSedule"}" <${process.env.SMTP_USER}>`,
    to,
    subject: "Welcome to MedSedule 💊",
    html,
  });
};
