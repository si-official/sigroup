import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const courseId = searchParams.get('courseId')
  const formData = await req.formData()
  const status = formData.get('status')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://school.sigroup.com.bd'

  if (status === 'VALID' || status === 'VALIDATED') {
    // TODO: enroll student in DB
    // enrollment happens client-side via StudentContext for now
    return NextResponse.redirect(`${appUrl}/payment/success?courseId=${courseId}`)
  }
  return NextResponse.redirect(`${appUrl}/payment/fail`)
}
