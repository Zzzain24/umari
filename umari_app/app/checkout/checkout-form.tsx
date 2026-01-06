"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { isLocalStorageAvailable } from '@/lib/cart-utils'
import type { CartItem } from '@/lib/types'
import { Loader2 } from 'lucide-react'

// Initialize Stripe
let stripePromise: Promise<any> | null = null

const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!publishableKey) {
      throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
    }
    stripePromise = loadStripe(publishableKey)
  }
  return stripePromise
}

interface CheckoutFormProps {
  menuId: string
  menuName: string
  platformFeePercentage: number
}

interface CheckoutFormContentProps extends CheckoutFormProps {
  paymentIntentData: {
    paymentIntentId: string
    subtotal: number
    platformFee: number
    total: number
  } | null
  onClientSecretReady: (
    clientSecret: string,
    data: {
      paymentIntentId: string
      subtotal: number
      platformFee: number
      total: number
    }
  ) => void
}

function CheckoutFormContent({
  menuId,
  menuName,
  platformFeePercentage,
  paymentIntentData,
  onClientSecretReady,
}: CheckoutFormContentProps) {
  // These hooks can be called even when not using payment yet - they'll just return null
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { toast } = useToast()

  const [cart, setCart] = useState<CartItem[]>([])
  const [isCreatingIntent, setIsCreatingIntent] = useState(false)
  const [subtotal, setSubtotal] = useState(0)
  const [platformFee, setPlatformFee] = useState(0)
  const [total, setTotal] = useState(0)

  // Form fields
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  // Load cart from localStorage
  useEffect(() => {
    if (!isLocalStorageAvailable()) return

    const storageKey = `umari-cart-${menuId}`
    try {
      const savedCart = localStorage.getItem(storageKey)
      if (savedCart) {
        const parsed = JSON.parse(savedCart) as CartItem[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCart(parsed)
          const cartSubtotal = parsed.reduce((sum, item) => sum + item.totalPrice, 0)
          const fee = (cartSubtotal * platformFeePercentage) / 100
          setSubtotal(cartSubtotal)
          setPlatformFee(fee)
          setTotal(cartSubtotal + fee)
        }
      }
    } catch (error) {
      console.error('Failed to load cart:', error)
    }
  }, [menuId, platformFeePercentage])

  // Create payment intent when form is ready
  const handleCreatePaymentIntent = async () => {
    if (!customerName || !customerEmail || !customerPhone || cart.length === 0) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setIsCreatingIntent(true)
    try {
      const response = await fetch('/api/checkout/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menuId,
          cart,
          customerName,
          customerEmail,
          customerPhone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent')
      }

      setSubtotal(data.subtotal)
      setPlatformFee(data.platformFee)
      setTotal(data.total)
      // Notify parent with clientSecret and payment intent data
      onClientSecretReady(data.clientSecret, {
        paymentIntentId: data.paymentIntentId,
        subtotal: data.subtotal,
        platformFee: data.platformFee,
        total: data.total,
      })
    } catch (error: any) {
      toast({
        title: 'Payment Error',
        description: error.message || 'Failed to initialize payment',
        variant: 'destructive',
      })
    } finally {
      setIsCreatingIntent(false)
    }
  }

  // If we have payment intent data, we're in payment mode - render payment form
  if (paymentIntentData && stripe && elements) {
    return (
      <div className="grid md:grid-cols-2 gap-8">
        <PaymentFormContent
          menuId={menuId}
          cart={cart}
          customerName={customerName}
          customerEmail={customerEmail}
          customerPhone={customerPhone}
          paymentIntentId={paymentIntentData.paymentIntentId}
          subtotal={paymentIntentData.subtotal}
          platformFee={paymentIntentData.platformFee}
          total={paymentIntentData.total}
        />
        <OrderSummary
          cart={cart}
          subtotal={paymentIntentData.subtotal}
          platformFee={paymentIntentData.platformFee}
          total={paymentIntentData.total}
          menuName={menuName}
        />
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="bg-muted/50 border border-border rounded-lg p-6 text-center">
        <p className="text-muted-foreground">Your cart is empty</p>
        <Button
          onClick={() => router.push(`/view/${menuId}`)}
          className="mt-4"
          variant="outline"
        >
          Return to Menu
        </Button>
      </div>
    )
  }

  // Customer info form mode
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <CustomerInfoForm
        menuId={menuId}
        customerName={customerName}
        customerEmail={customerEmail}
        customerPhone={customerPhone}
        onNameChange={setCustomerName}
        onEmailChange={setCustomerEmail}
        onPhoneChange={setCustomerPhone}
        onCreatePaymentIntent={handleCreatePaymentIntent}
        isCreatingIntent={isCreatingIntent}
        disabled={isCreatingIntent}
      />
      <OrderSummary
        cart={cart}
        subtotal={subtotal}
        platformFee={platformFee}
        total={total}
        menuName={menuName}
      />
    </div>
  )
}

// Order summary component
function OrderSummary({
  cart,
  subtotal,
  platformFee,
  total,
  menuName,
}: {
  cart: CartItem[]
  subtotal: number
  platformFee: number
  total: number
  menuName: string
}) {
  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <div className="space-y-3 mb-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-start pb-3 border-b border-border last:border-0 last:pb-0"
            >
              <div className="flex-1">
                <p className="font-medium">
                  {item.quantity}x {item.itemName}
                </p>
                {item.selectedOptions && item.selectedOptions.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                    {item.selectedOptions.map((opt, i) => (
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

        <div className="space-y-2 pt-4 border-t border-border">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {platformFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service Fee:</span>
              <span>${platformFee.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-muted/30 border border-border rounded-lg p-4">
        <p className="text-xs text-muted-foreground mb-1">Ordering from</p>
        <p className="font-medium">{menuName}</p>
      </div>
    </div>
  )
}

// Customer info form component (before payment intent)
function CustomerInfoForm({
  menuId,
  customerName,
  customerEmail,
  customerPhone,
  onNameChange,
  onEmailChange,
  onPhoneChange,
  onCreatePaymentIntent,
  isCreatingIntent,
  disabled,
}: {
  menuId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  onNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPhoneChange: (value: string) => void
  onCreatePaymentIntent: () => void
  isCreatingIntent: boolean
  disabled: boolean
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="customerName">Name *</Label>
          <Input
            id="customerName"
            value={customerName}
            onChange={(e) => onNameChange(e.target.value)}
            required
            disabled={disabled}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="customerEmail">Email *</Label>
          <Input
            id="customerEmail"
            type="email"
            value={customerEmail}
            onChange={(e) => onEmailChange(e.target.value)}
            required
            disabled={disabled}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="customerPhone">Phone *</Label>
          <Input
            id="customerPhone"
            type="tel"
            value={customerPhone}
            onChange={(e) => onPhoneChange(e.target.value)}
            required
            disabled={disabled}
            className="mt-1"
          />
        </div>

        <Button
          type="button"
          onClick={onCreatePaymentIntent}
          disabled={isCreatingIntent || !customerName || !customerEmail || !customerPhone}
          className="w-full"
        >
          {isCreatingIntent ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Continue to Payment'
          )}
        </Button>
      </div>
    </div>
  )
}

// Payment form component (after payment intent created)
function PaymentFormContent({
  menuId,
  cart,
  customerName,
  customerEmail,
  customerPhone,
  paymentIntentId,
  subtotal,
  platformFee,
  total,
}: {
  menuId: string
  cart: CartItem[]
  customerName: string
  customerEmail: string
  customerPhone: string
  paymentIntentId: string
  subtotal: number
  platformFee: number
  total: number
}) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)

    try {
      // Confirm payment
      const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
        },
        redirect: 'if_required',
      })

      if (paymentError) {
        throw new Error(paymentError.message || 'Payment failed')
      }

      if (paymentIntent?.status === 'succeeded') {
        // Create order
        const orderResponse = await fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            menuId,
            cart,
            customerName,
            customerEmail,
            customerPhone,
            stripePaymentIntentId: paymentIntentId,
          }),
        })

        const orderData = await orderResponse.json()

        if (!orderResponse.ok) {
          throw new Error(orderData.error || 'Failed to create order')
        }

        // Clear cart
        if (isLocalStorageAvailable()) {
          const storageKey = `umari-cart-${menuId}`
          localStorage.removeItem(storageKey)
        }

        // Redirect to confirmation page
        router.push(`/order-confirmation?orderNumber=${orderData.orderNumber}`)
      }
    } catch (error: any) {
      toast({
        title: 'Payment Failed',
        description: error.message || 'An error occurred during payment',
        variant: 'destructive',
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <PaymentElement />
        </div>

        <Button type="submit" disabled={isLoading || !stripe} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Payment...
            </>
          ) : (
            `Pay $${total.toFixed(2)}`
          )}
        </Button>
      </form>
    </div>
  )
}

export function CheckoutForm(props: CheckoutFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentData, setPaymentIntentData] = useState<{
    paymentIntentId: string
    subtotal: number
    platformFee: number
    total: number
  } | null>(null)

  const handleClientSecretReady = (secret: string, data: {
    paymentIntentId: string
    subtotal: number
    platformFee: number
    total: number
  }) => {
    setClientSecret(secret)
    setPaymentIntentData(data)
  }

  // Always wrap in Elements, but only provide clientSecret when we have it
  const stripeOptions: StripeElementsOptions = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: 'stripe',
        },
      }
    : {
        appearance: {
          theme: 'stripe',
        },
      }

  return (
    <Elements
      stripe={getStripe()}
      options={stripeOptions}
      key={clientSecret || 'initial'} // Force re-render when clientSecret changes
    >
      <CheckoutFormContent
        {...props}
        paymentIntentData={paymentIntentData}
        onClientSecretReady={handleClientSecretReady}
      />
    </Elements>
  )
}

