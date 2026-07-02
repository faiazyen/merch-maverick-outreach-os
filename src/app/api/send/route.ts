import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";
export const maxDuration = 30;

// Optional in-app send via Gmail SMTP + App Password (BYOK, sent per-request).
// Primary send path is the Gmail compose deep-link (human presses send);
// this route exists for users who prefer one-click sending from the queue.

export async function POST(req: NextRequest) {
  let body: {
    smtpUser: string;
    smtpAppPassword: string;
    fromName: string;
    to: string;
    subject: string;
    text: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { smtpUser, smtpAppPassword, fromName, to, subject, text } = body;
  if (!smtpUser || !smtpAppPassword) {
    return NextResponse.json(
      { error: "SMTP not configured — add your Gmail address + App Password in Settings." },
      { status: 400 },
    );
  }
  if (!to || !subject || !text) {
    return NextResponse.json({ error: "Missing to/subject/text" }, { status: 400 });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: smtpUser, pass: smtpAppPassword },
    });
    const info = await transporter.sendMail({
      from: fromName ? `"${fromName}" <${smtpUser}>` : smtpUser,
      to,
      subject,
      text,
    });
    return NextResponse.json({ ok: true, messageId: info.messageId });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "SMTP send failed" },
      { status: 502 },
    );
  }
}
