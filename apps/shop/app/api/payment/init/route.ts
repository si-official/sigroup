import { NextRequest, NextResponse } from 'next/server'
import { initiateSSLPayment } from '@/lib/sslcommerz'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, address, items, total } = body

    const orderId = `SI-${Date.now()}-${uuidv4().slice(0, 6).toUpperCase()}`

    // Store order in session/DB here (simplified)
    const productNames = items.map((i: { name: string }) => i.name).join(', ')

    const result = await initiateSSLPayment({
      orderId,
      amount: total,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      customerAddress: address,
      productName: productNames,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Payment init error:', error)
    return NextResponse.json({ error: 'Payment initialization failed' }, { status: 500 })
  }
}
