import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  // TODO: Validate token against DB
  // const order = await db.order.findOne({ id: orderId, download_token: token, status: 'paid' })
  // if (!order) return NextResponse.json({ error: 'Invalid or expired download link' }, { status: 403 })

  // For now — mock validation
  if (!token || !orderId) {
    return NextResponse.json({ error: 'Invalid download link' }, { status: 403 })
  }

  // Stream the file
  // const fileBuffer = await fs.readFile(path.join(process.cwd(), 'downloads', order.download_file))
  // return new NextResponse(fileBuffer, {
  //   headers: {
  //     'Content-Disposition': `attachment; filename="${order.product_name}.zip"`,
  //     'Content-Type': 'application/zip',
  //   },
  // })

  return NextResponse.json({ message: 'Download ready', orderId, token })
}
