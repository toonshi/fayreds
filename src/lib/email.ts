import nodemailer from "nodemailer";
import { site } from "./site";

// Uses any SMTP account. For Gmail: SMTP_HOST=smtp.gmail.com, SMTP_PORT=465,
// SMTP_USER=fayredstravel@gmail.com, SMTP_PASS=<Google "App password">.
let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;
function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  transporter ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: Number(process.env.SMTP_PORT ?? 465) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

function wrap(title: string, bodyHtml: string) {
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1f2a2e">
  <div style="background:#0f4c4a;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0">
    <strong style="font-size:20px">${site.name}</strong></div>
  <div style="border:1px solid #e5e1d8;border-top:0;padding:24px;border-radius:0 0 12px 12px">
    <h2 style="margin-top:0;color:#0f4c4a">${title}</h2>${bodyHtml}
    <p style="color:#6b7377;font-size:13px;margin-top:28px">${site.name} · ${site.phoneDisplay} · ${site.email}</p>
  </div></div>`;
}

export async function sendEmail(to: string, subject: string, title: string, bodyHtml: string) {
  const t = getTransporter();
  if (!t) {
    console.log(`[email:demo] to ${to}: ${subject}`);
    return { sent: false };
  }
  try {
    await t.sendMail({
      from: `"${site.name}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      replyTo: site.email,
      to,
      subject,
      html: wrap(title, bodyHtml),
    });
    return { sent: true };
  } catch (err) {
    console.error("[email] error", err);
    return { sent: false };
  }
}

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
