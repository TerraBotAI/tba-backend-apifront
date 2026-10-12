import { NextResponse } from "next/server";
export function success<T>(data: T, meta?: Record<string, unknown>, status = 200) { return NextResponse.json({ success: true, data, ...(meta ? { meta } : {}) }, { status }); }
export function noContent() { return new NextResponse(null, { status: 204 }); }
