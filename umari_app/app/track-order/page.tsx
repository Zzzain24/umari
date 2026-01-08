"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LandingNavbar } from '@/components/landing/landing-navbar'
import { Loader2 } from 'lucide-react'

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Force light mode for consistency with landing page
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("dark", "system")
    root.classList.add("light")
  }, [])

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOrder(null)

    try {
      const response = await fetch(
        `/api/orders/lookup?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Order not found')
      }

      const data = await response.json()
      setOrder(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400'
      case 'preparing':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'ready':
        return 'text-blue-600 dark:text-blue-400'
      case 'cancelled':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <div className="min-h-screen w-full relative bg-background">
      {/* Pearl Mist Background with Top Glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(ellipse 50% 35% at 50% 0%, rgba(226, 232, 240, 0.3), transparent 60%)",
        }}
      />

      <LandingNavbar />

      <div className="relative z-10 container max-w-2xl mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
        <p className="text-muted-foreground mb-8">
          Enter your order number and email to view your order status
        </p>

        {/* Lookup Form */}
        <form onSubmit={handleLookup} className="space-y-4 bg-card border border-border rounded-lg p-6">
          <div>
            <Label htmlFor="orderNumber">Order Number</Label>
            <Input
              id="orderNumber"
              placeholder="ORD-20260105-A3F2"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              required
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Found in your order confirmation email
            </p>
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              The email you used when placing the order
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Looking up...
              </>
            ) : (
              'Track Order'
            )}
          </Button>
        </form>

        {/* Error State */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            <p className="text-red-600 dark:text-red-400 text-xs mt-1">
              Please check your order number and email address and try again.
            </p>
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div className="mt-8 space-y-6">
            {/* Status Card */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Order Status</h2>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Order Number:</span>
                  <span className="font-mono font-medium">{order.order_number}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium capitalize ${getStatusColor(order.order_status)}`}>
                    {order.order_status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Payment:</span>
                  <span className={`font-medium capitalize ${order.payment_status === 'succeeded' ? 'text-green-600 dark:text-green-400' : ''}`}>
                    {order.payment_status}
                  </span>
                </div>

                {order.order_type && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium capitalize">{order.order_type.replace('_', ' ')}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Placed:</span>
                  <span className="font-medium">
                    {new Date(order.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Items Card */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-start pb-3 border-b border-border last:border-0 last:pb-0">
                    <div className="flex-1">
                      <p className="font-medium">
                        {item.quantity}x {item.itemName}
                      </p>
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                          {item.selectedOptions.map((opt: any, i: number) => (
                            <p key={i}>
                              {opt.optionName}: {opt.selectedValue}
                              {opt.additionalPrice > 0 && ` (+$${opt.additionalPrice.toFixed(2)})`}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="font-medium ml-4">${item.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            {order.special_instructions && (
              <div className="bg-muted/50 border border-border rounded-lg p-4">
                <p className="text-sm font-medium mb-1">Special Instructions:</p>
                <p className="text-sm text-muted-foreground">{order.special_instructions}</p>
              </div>
            )}

            {/* Business Info */}
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">From</p>
              <p className="font-medium">{order.menu_name}</p>
              <p className="text-sm text-muted-foreground">{order.business_name}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
