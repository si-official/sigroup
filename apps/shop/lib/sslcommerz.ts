export const SSL_CONFIG = {
  store_id: process.env.SSL_STORE_ID || 'your_store_id',
  store_passwd: process.env.SSL_STORE_PASSWORD || 'your_store_password',
  is_live: process.env.SSL_IS_LIVE === 'true',
  base_url: process.env.SSL_IS_LIVE === 'true'
    ? 'https://securepay.sslcommerz.com'
    : 'https://sandbox.sslcommerz.com',
}

export interface SSLPaymentData {
  orderId: string
  amount: number
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  productName: string
}

export async function initiateSSLPayment(data: SSLPaymentData) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shop.sigroup.com.bd'

  const params = new URLSearchParams({
    store_id: SSL_CONFIG.store_id,
    store_passwd: SSL_CONFIG.store_passwd,
    total_amount: data.amount.toString(),
    currency: 'BDT',
    tran_id: data.orderId,
    success_url: `${appUrl}/api/payment/success`,
    fail_url: `${appUrl}/api/payment/fail`,
    cancel_url: `${appUrl}/api/payment/cancel`,
    ipn_url: `${appUrl}/api/payment/success`,
    cus_name: data.customerName,
    cus_email: data.customerEmail,
    cus_add1: data.customerAddress,
    cus_city: 'Dhaka',
    cus_country: 'Bangladesh',
    cus_phone: data.customerPhone,
    product_name: data.productName,
    product_category: 'Software',
    product_profile: 'non-physical-goods',
    shipping_method: 'NO',
    num_of_item: '1',
    weight_of_items: '0',
    product_amount: data.amount.toString(),
  })

  const response = await fetch(
    `${SSL_CONFIG.base_url}/gwprocess/v4/api.php`,
    { method: 'POST', body: params }
  )

  return response.json()
}
