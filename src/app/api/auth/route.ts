import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { code } = (await req.json().catch(() => ({}))) as { code?: string };
  const expected = process.env.ACCESS_CODE;
  if (!expected) return NextResponse.json({ ok: true }); // gate open in dev
  if (code !== expected) {
    return NextResponse.json({ error: "Wrong access code" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("oos_auth", expected, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}
