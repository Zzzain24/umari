import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const menuId = request.nextUrl.searchParams.get('menuId')

  if (!menuId) {
    return NextResponse.json({ connected: false }, { status: 400 })
  }

  const supabase = await createClient()

  // Get menu owner
  const { data: menu } = await supabase
    .from('menus')
    .select('user_id')
    .eq('id', menuId)
    .single()

  if (!menu) {
    return NextResponse.json({ connected: false }, { status: 404 })
  }

  // Check if owner has connected Stripe
  const { data: stripeAccount } = await supabase
    .from('stripe_accounts')
    .select('charges_enabled')
    .eq('user_id', menu.user_id)
    .single()

  const connected = stripeAccount?.charges_enabled || false

  return NextResponse.json({ connected })
}
