import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/fail`)
}
