import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.ADMIN_TOKEN;

  return NextResponse.json({
    hasToken: !!token,
    tokenLength: token?.length || 0,
    tokenPreview: token ? token.substring(0, 10) + '...' + token.substring(token.length - 10) : 'NOT_SET',
    nodeEnv: process.env.NODE_ENV,
  });
}
