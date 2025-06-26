import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Poll video operation test route works!' });
}

export async function POST() {
  return NextResponse.json({ message: 'Poll video operation POST test route works!' });
} 