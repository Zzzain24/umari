import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role to bypass RLS for guest lookups
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const orderNumber = request.nextUrl.searchParams.get('orderNumber')
  const email = request.nextUrl.searchParams.get('email')

  // Validate inputs
  if (!orderNumber || !email) {
    return NextResponse.json(
      { error: 'Order number and email are required' },
      { status: 400 }
    )
  }

  try {
    // Fetch order with email verification (no joins needed - business_name and business_email are in orders table)
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber.trim().toUpperCase())
      .ilike('customer_email', email.trim())
      .single()

    if (error || !order) {
      return NextResponse.json(
        { error: 'Order not found or email does not match' },
        { status: 404 }
      )
    }

    // Get menu name if needed (optional - business_name is already in orders table)
    let menuName = null
    if (order.menu_id) {
      const { data: menu } = await supabaseAdmin
        .from('menus')
        .select('name')
        .eq('id', order.menu_id)
        .single()
      menuName = menu?.name || null
    }

    // Return sanitized order details (don't expose sensitive data)
    return NextResponse.json({
      order_number: order.order_number,
      items: order.items,
      subtotal: order.subtotal,
      platform_fee: order.platform_fee,
      total: order.total,
      order_status: order.order_status,
      payment_status: order.payment_status,
      order_type: order.order_type,
      created_at: order.created_at,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      menu_name: menuName,
      business_name: order.business_name,
      business_email: order.business_email,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to retrieve order' },
      { status: 500 }
    )
  }
}
