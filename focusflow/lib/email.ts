import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendVerificationEmail(to: string, name: string, code: string) {
  await transporter.sendMail({
    from: `"FocusFlow" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Verify your FocusFlow account',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:16px;">
        <h2 style="color:#4f46e5;margin-bottom:8px;">Welcome to FocusFlow, ${name}!</h2>
        <p style="color:#6b7280;margin-bottom:24px;">Enter this code to verify your account:</p>
        <div style="background:#fff;border:2px solid #e0e7ff;border-radius:12px;padding:24px;text-align:center;">
          <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#4f46e5;">${code}</span>
        </div>
        <p style="color:#9ca3af;font-size:13px;margin-top:24px;">This code expires in 15 minutes. If you didn't create an account, ignore this email.</p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(to: string, code: string) {
  await transporter.sendMail({
    from: `"FocusFlow" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Reset your FocusFlow password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:16px;">
        <h2 style="color:#4f46e5;margin-bottom:8px;">Password Reset</h2>
        <p style="color:#6b7280;margin-bottom:24px;">Enter this code to reset your password:</p>
        <div style="background:#fff;border:2px solid #e0e7ff;border-radius:12px;padding:24px;text-align:center;">
          <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#4f46e5;">${code}</span>
        </div>
        <p style="color:#9ca3af;font-size:13px;margin-top:24px;">This code expires in 15 minutes. If you didn't request this, ignore this email.</p>
      </div>
    `,
  })
}
