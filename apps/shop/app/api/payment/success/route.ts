import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const status = formData.get('status')
  const tranId = formData.get('tran_id') as string
  // const valId = formData.get('val_id') as string  // stored to DB on real implementation

  if (status === 'VALID' || status === 'VALIDATED') {
    // Generate secure download token
    const downloadToken = uuidv4()

    // TODO: Save to DB — order paid, token generated
    // await db.order.update({ tran_id: tranId }, { status: 'paid', download_token: downloadToken, val_id: valId })

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?token=${downloadToken}&tran_id=${tranId}`
    )
  }

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/fail`)
}

// IPN (Instant Payment Notification)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  const tranId = searchParams.get('tran_id')
  return NextResponse.json({ token, tranId })
}
