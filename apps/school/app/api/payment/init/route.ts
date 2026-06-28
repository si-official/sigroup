import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email, phone, courseId, amount, productName } = body
  const orderId = `SISCHOOL-${Date.now()}`
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://school.sigroup.com.bd'

  const params = new URLSearchParams({
    store_id: process.env.SSL_STORE_ID || 'your_store_id',
    store_passwd: process.env.SSL_STORE_PASSWORD || 'your_store_password',
    total_amount: amount.toString(),
    currency: 'BDT',
    tran_id: orderId,
    success_url: `${appUrl}/api/payment/success?courseId=${courseId}&studentEmail=${email}`,
    fail_url: `${appUrl}/payment/fail`,
    cancel_url: `${appUrl}/payment/cancel`,
    cus_name: name, cus_email: email, cus_phone: phone,
    cus_add1: 'Bangladesh', cus_city: 'Dhaka', cus_country: 'Bangladesh',
    product_name: productName,
    product_category: 'Education',
    product_profile: 'non-physical-goods',
    shipping_method: 'NO',
    num_of_item: '1', weight_of_items: '0', product_amount: amount.toString(),
  })

  const isLive = process.env.SSL_IS_LIVE === 'true'
  const baseUrl = isLive ? 'https://securepay.sslcommerz.com' : 'https://sandbox.sslcommerz.com'

  const res = await fetch(`${baseUrl}/gwprocess/v4/api.php`, { method: 'POST', body: params })
  return NextResponse.json(await res.json())
}
