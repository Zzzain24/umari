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
    // Fetch order with email verification
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        menus!inner(name, user_id, users!inner(first_name, last_name))
      `)
      .eq('order_number', orderNumber.trim().toUpperCase())
      .ilike('customer_email', email.trim())
      .single()

    if (error || !order) {
      return NextResponse.json(
        { error: 'Order not found or email does not match' },
        { status: 404 }
      )
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
      special_instructions: order.special_instructions,
      created_at: order.created_at,
      customer_name: order.customer_name,
      menu_name: order.menus?.name,
      business_name: order.business_name || `${order.menus?.users?.first_name} ${order.menus?.users?.last_name}`,
    })
  } catch (err: any) {
    console.error('Order lookup error:', err)
    return NextResponse.json(
      { error: 'Failed to retrieve order' },
      { status: 500 }
    )
  }
}
