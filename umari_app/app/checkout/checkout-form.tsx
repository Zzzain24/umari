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
import { Loader2, ArrowLeft } from 'lucide-react'

// Initialize Stripe with connected account context for consistent payment methods
// Always passes stripeAccountId when available to ensure PaymentElement shows correct payment options
const stripePromiseCache = new Map<string, Promise<any>>()

const getStripe = (stripeAccountId?: string) => {
  const cacheKey = stripeAccountId || 'platform'

  if (!stripePromiseCache.has(cacheKey)) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!publishableKey) {
      throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
    }

    // Load Stripe with connected account context for consistent payment methods
    // The payment intent creation API handles which account to charge based on test_mode
    const options = stripeAccountId ? { stripeAccount: stripeAccountId } : undefined
    stripePromiseCache.set(cacheKey, loadStripe(publishableKey, options))
  }

  return stripePromiseCache.get(cacheKey)!
}

interface CheckoutFormProps {
  menuId: string
  menuName: string
  platformFeePercentage: number
  testMode?: boolean
}

interface CheckoutFormContentProps extends CheckoutFormProps {
  paymentIntentData: {
    paymentIntentId: string
    stripeAccountId: string
    subtotal: number
    platformFee: number
    total: number
    customerName: string
    customerEmail: string
  } | null
  customerName: string
  customerEmail: string
  onCustomerNameChange: (value: string) => void
  onCustomerEmailChange: (value: string) => void
  onClientSecretReady: (
    clientSecret: string,
    data: {
      paymentIntentId: string
      stripeAccountId: string
      subtotal: number
      platformFee: number
      total: number
      customerName: string
      customerEmail: string
    }
  ) => void
  onBackToCustomerInfo: () => void
}

function CheckoutFormContent({
  menuId,
  menuName,
  platformFeePercentage,
  paymentIntentData,
  customerName,
  customerEmail,
  onCustomerNameChange,
  onCustomerEmailChange,
  onClientSecretReady,
  onBackToCustomerInfo,
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

  // Load cart from localStorage
  useEffect(() => {
    if (!isLocalStorageAvailable()) return

    const storageKey = `umari-cart-${menuId}`
    try {
      const savedCart = localStorage.getItem(storageKey)
      if (savedCart) {
        const parsed = JSON.parse(savedCart) as CartItem[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Migrate old cart items that don't have optionsPrice
          const migratedCart = parsed.map(item => {
            if (item.optionsPrice === undefined) {
              const optionsPrice = item.selectedOptions.reduce(
                (sum, opt) => sum + opt.additionalPrice, 0
              )
              return { ...item, optionsPrice }
            }
            return item
          })

          setCart(migratedCart)
          const cartSubtotal = migratedCart.reduce((sum, item) => sum + item.totalPrice, 0)
          const fee = (cartSubtotal * platformFeePercentage) / 100
          setSubtotal(cartSubtotal)
          setPlatformFee(fee)
          setTotal(cartSubtotal) // Customer pays subtotal only, platform fee comes from business share
        }
      }
    } catch (error) {
      // Failed to load cart from localStorage
    }
  }, [menuId, platformFeePercentage])

  // Create payment intent when form is ready
  const handleCreatePaymentIntent = async () => {
    if (!customerName || !customerEmail || cart.length === 0) {
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
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent')
      }

      setSubtotal(data.subtotal)
      setPlatformFee(data.platformFee)
      setTotal(data.total) // This is now just subtotal
      // Notify parent with clientSecret and payment intent data (including customer info)
      onClientSecretReady(data.clientSecret, {
        paymentIntentId: data.paymentIntentId,
        stripeAccountId: data.stripeAccountId,
        subtotal: data.subtotal,
        platformFee: data.platformFee,
        total: data.total,
        customerName,
        customerEmail,
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
  // Use customer info from paymentIntentData to ensure it persists across re-renders
  if (paymentIntentData && stripe && elements) {
    return (
      <div className="grid md:grid-cols-2 gap-8">
        <PaymentFormContent
          menuId={menuId}
          cart={cart}
          customerName={paymentIntentData.customerName || customerName}
          customerEmail={paymentIntentData.customerEmail || customerEmail}
          paymentIntentId={paymentIntentData.paymentIntentId}
          subtotal={paymentIntentData.subtotal}
          platformFee={paymentIntentData.platformFee}
          total={paymentIntentData.total}
          onBack={onBackToCustomerInfo}
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
        onNameChange={onCustomerNameChange}
        onEmailChange={onCustomerEmailChange}
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

        <div className="space-y-2 pt-4 border-t border-border">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-border rounded-lg p-4">
        <p className="text-xs text-muted-foreground mb-1">Ordering from</p>
        <p className="font-medium">{menuName}</p>
      </div>
    </div>
  )
}

// Validation helpers
function isValidName(name: string): boolean {
  // Name should be at least 2 characters and contain only letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s'-]{2,}$/
  return nameRegex.test(name.trim())
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Customer info form component (before payment intent)
function CustomerInfoForm({
  menuId,
  customerName,
  customerEmail,
  onNameChange,
  onEmailChange,
  onCreatePaymentIntent,
  isCreatingIntent,
  disabled,
}: {
  menuId: string
  customerName: string
  customerEmail: string
  onNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onCreatePaymentIntent: () => void
  isCreatingIntent: boolean
  disabled: boolean
}) {
  const [nameError, setNameError] = useState<string>('')
  const [emailError, setEmailError] = useState<string>('')
  const [touched, setTouched] = useState({
    name: false,
    email: false,
  })

  const handleNameChange = (value: string) => {
    onNameChange(value)
    if (touched.name) {
      if (value && !isValidName(value)) {
        setNameError('Please enter a valid name (at least 2 characters)')
      } else {
        setNameError('')
      }
    }
  }

  const handleEmailChange = (value: string) => {
    onEmailChange(value)
    if (touched.email) {
      if (value && !isValidEmail(value)) {
        setEmailError('Please enter a valid email address')
      } else {
        setEmailError('')
      }
    }
  }

  const handleNameBlur = () => {
    setTouched({ ...touched, name: true })
    if (customerName && !isValidName(customerName)) {
      setNameError('Please enter a valid name (at least 2 characters)')
    } else {
      setNameError('')
    }
  }

  const handleEmailBlur = () => {
    setTouched({ ...touched, email: true })
    if (customerEmail && !isValidEmail(customerEmail)) {
      setEmailError('Please enter a valid email address')
    } else {
      setEmailError('')
    }
  }

  const isFormValid =
    customerName.trim() &&
    isValidName(customerName) &&
    customerEmail.trim() &&
    isValidEmail(customerEmail)

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="customerName">Name *</Label>
          <Input
            id="customerName"
            value={customerName}
            onChange={(e) => handleNameChange(e.target.value)}
            onBlur={handleNameBlur}
            required
            disabled={disabled}
            className={`mt-1 ${nameError ? 'border-red-500' : ''}`}
            placeholder="John Doe"
          />
          {nameError && (
            <p className="text-sm text-red-500 mt-1">{nameError}</p>
          )}
        </div>

        <div>
          <Label htmlFor="customerEmail">Email *</Label>
          <Input
            id="customerEmail"
            type="email"
            value={customerEmail}
            onChange={(e) => handleEmailChange(e.target.value)}
            onBlur={handleEmailBlur}
            required
            disabled={disabled}
            className={`mt-1 ${emailError ? 'border-red-500' : ''}`}
            placeholder="john@example.com"
          />
          {emailError && (
            <p className="text-sm text-red-500 mt-1">{emailError}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Order confirmation and updates will be sent to this email
          </p>
        </div>

        <Button
          type="button"
          onClick={onCreatePaymentIntent}
          disabled={isCreatingIntent || !isFormValid}
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
  paymentIntentId,
  subtotal,
  platformFee,
  total,
  onBack,
}: {
  menuId: string
  cart: CartItem[]
  customerName: string
  customerEmail: string
  paymentIntentId: string
  subtotal: number
  platformFee: number
  total: number
  onBack: () => void
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
            stripePaymentIntentId: paymentIntentId,
            paymentStatus: paymentIntent.status, // Pass actual Stripe payment status
          }),
        })

        const orderData = await orderResponse.json()

        if (!orderResponse.ok) {
          throw new Error(orderData.error || 'Failed to create order')
        }

        // Clear cart and customer info
        if (isLocalStorageAvailable()) {
          const cartStorageKey = `umari-cart-${menuId}`
          const customerStorageKey = `umari-customer-${menuId}`
          localStorage.removeItem(cartStorageKey)
          localStorage.removeItem(customerStorageKey)
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
      <div className="flex items-center mb-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mr-2 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h2 className="text-xl font-semibold">Payment Information</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <PaymentElement
            options={{
              wallets: {
                applePay: 'auto',
                googlePay: 'auto',
                cashapp: 'auto',
              },
            }}
          />
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
  const { menuId, testMode = false } = props
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null)
  const [paymentIntentData, setPaymentIntentData] = useState<{
    paymentIntentId: string
    stripeAccountId: string
    subtotal: number
    platformFee: number
    total: number
    customerName: string
    customerEmail: string
  } | null>(null)

  // Customer form state - lifted to parent to persist across navigation
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')

  // Load customer info from localStorage on mount
  useEffect(() => {
    if (!isLocalStorageAvailable()) return

    const storageKey = `umari-customer-${menuId}`
    try {
      const savedCustomerInfo = localStorage.getItem(storageKey)
      if (savedCustomerInfo) {
        const parsed = JSON.parse(savedCustomerInfo)
        if (parsed.customerName) setCustomerName(parsed.customerName)
        if (parsed.customerEmail) setCustomerEmail(parsed.customerEmail)
      }
    } catch (error) {
      // Failed to load customer info from localStorage
    }
  }, [menuId])

  // Save customer info to localStorage when it changes
  useEffect(() => {
    if (!isLocalStorageAvailable()) return

    // Only save if at least one field has data
    if (customerName || customerEmail) {
      const storageKey = `umari-customer-${menuId}`
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          customerName,
          customerEmail,
        }))
      } catch (error) {
        // Failed to save customer info to localStorage
      }
    }
  }, [customerName, customerEmail, menuId])

  const handleClientSecretReady = (secret: string, data: {
    paymentIntentId: string
    stripeAccountId: string
    subtotal: number
    platformFee: number
    total: number
    customerName: string
    customerEmail: string
  }) => {
    setClientSecret(secret)
    setStripeAccountId(data.stripeAccountId)
    setPaymentIntentData(data)
    // Persist customer data in parent state to survive navigation
    setCustomerName(data.customerName)
    setCustomerEmail(data.customerEmail)
  }

  const handleBackToCustomerInfo = () => {
    // Clear payment intent data to go back to customer info form
    // Customer info persists in parent state (customerName, customerEmail, customerPhone)
    setPaymentIntentData(null)
    setClientSecret(null)
    setStripeAccountId(null)
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

  // Match Stripe initialization to where payment intent was created:
  // - test_mode = TRUE: Payment intent on platform account → load Stripe without stripeAccount
  // - test_mode = FALSE: Payment intent on connected account → load Stripe with stripeAccount
  // The clientSecret must match the Stripe instance context
  const stripeInstance = testMode ? getStripe(undefined) : getStripe(stripeAccountId || undefined)
  
  return (
    <Elements
      stripe={stripeInstance}
      options={stripeOptions}
      key={`${testMode ? 'platform' : stripeAccountId || 'platform'}-${clientSecret || 'no-secret'}`} // Force re-render when account or secret changes
    >
      <CheckoutFormContent
        {...props}
        paymentIntentData={paymentIntentData}
        customerName={customerName}
        customerEmail={customerEmail}
        onCustomerNameChange={setCustomerName}
        onCustomerEmailChange={setCustomerEmail}
        onClientSecretReady={handleClientSecretReady}
        onBackToCustomerInfo={handleBackToCustomerInfo}
      />
    </Elements>
  )
}

