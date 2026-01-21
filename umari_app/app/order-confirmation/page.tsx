import { notFound, redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

// Use service role to fetch order by order number (guest access)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface PageProps {
  searchParams: Promise<{ orderNumber?: string }>
}

export default async function OrderConfirmationPage({ searchParams }: PageProps) {
  const params = await searchParams
  const orderNumber = params.orderNumber

  if (!orderNumber) {
    redirect('/')
  }

  try {
    // Fetch order by order number
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber.toUpperCase())
      .single()

    if (error || !order) {
      notFound()
    }

    const items = order.items as any[]

    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="container max-w-3xl mx-auto px-4 py-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground">
              Thank you for your order. Please check you email for your order confirmation and order status updates.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Number:</span>
                <span className="font-mono font-semibold">{order.order_number}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Status:</span>
                <span className="font-medium capitalize">{order.order_status}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Status:</span>
                <span
                  className={`font-medium capitalize ${order.payment_status === 'succeeded'
                    ? 'text-green-600 dark:text-green-400'
                    : ''
                    }`}
                >
                  {order.payment_status}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Placed:</span>
                <span className="font-medium">
                  {new Date(order.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t border-border pt-4">
              <h3 className="font-semibold mb-3">Items Ordered</h3>
              <div className="space-y-3">
                {items.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-start pb-3 border-b border-border last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {item.quantity}x {item.itemName}
                      </p>
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                          {item.selectedOptions.map((opt: any, i: number) => (
                            <p key={i}>
                              {opt.optionName}: {opt.selectedValue}
                              {opt.additionalPrice > 0 &&
                                ` (+$${opt.additionalPrice.toFixed(2)})`}
                            </p>
                          ))}
                        </div>
                      )}
                      {item.specialInstructions && (
                        <p className="text-xs text-muted-foreground italic mt-1">
                          Note: {item.specialInstructions}
                        </p>
                      )}
                    </div>
                    <span className="font-medium ml-4">${item.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Totals */}
            <div className="border-t border-border pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>${parseFloat(order.total.toString()).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-muted/30 border border-border rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2">Customer Information</h3>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Name:</span>{' '}
                <span className="font-medium">{order.customer_name}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Email:</span>{' '}
                <span className="font-medium">{order.customer_email}</span>
              </p>
            </div>
          </div>

          {/* Track Order Link */}
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <h3 className="font-semibold mb-2">Track Your Order</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Use your order number and email to track your order status anytime.
            </p>
            <Link href={`/track-order?orderNumber=${order.order_number}&email=${encodeURIComponent(order.customer_email || '')}`}>
              <Button variant="outline" className="w-full sm:w-auto">
                Track Order
              </Button>
            </Link>
          </div>

          {/* Return to Menu */}
          <div className="text-center mt-6">
            <Link href="/">
              <Button variant="ghost">Return to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    notFound()
  }
}

