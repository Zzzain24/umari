import { Resend } from 'resend'
import type { CartItem } from './types'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
const APP_URL = 'https://www.umari.app'

// Umari brand colors
const COLORS = {
  primary: '#c76c3c',
  secondary: '#4a7c7c',
  background: '#f5f3ef',
  foreground: '#121113',
  success: '#22c55e',
  destructive: '#dc2626',
  muted: '#6b7280',
  border: '#e5e7eb',
  white: '#ffffff',
}

interface OrderEmailData {
  orderNumber: string
  customerName: string
  customerEmail: string
  businessName: string
  items: CartItem[]
  subtotal: number
  total: number
  orderDate: string
  orderStatus?: 'received' | 'ready' | 'cancelled'
}

const getEmailWrapper = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: ${COLORS.foreground}; background-color: ${COLORS.background}; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto;">
    ${content}
    <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid ${COLORS.border};">
      <a href="${APP_URL}" style="text-decoration: none;">
        <span style="font-size: 18px; font-weight: 600; color: ${COLORS.foreground};">Umari</span>
      </a>
      <p style="margin: 8px 0 0 0; font-size: 13px; color: ${COLORS.muted};">Simple menus, seamless orders</p>
    </div>
  </div>
</body>
</html>
`

const getItemsHtml = (items: CartItem[]) => items.map(item => `
  <tr>
    <td style="padding: 16px 0; border-bottom: 1px solid ${COLORS.border};">
      <div style="font-weight: 500; color: ${COLORS.foreground};">${item.quantity}x ${item.itemName}</div>
      ${item.selectedOptions && item.selectedOptions.length > 0 ? `
        <div style="font-size: 14px; color: ${COLORS.muted}; margin-top: 4px;">
          ${item.selectedOptions.map(opt => `${opt.optionName}: ${opt.selectedValue}${opt.additionalPrice > 0 ? ` (+$${opt.additionalPrice.toFixed(2)})` : ''}`).join('<br>')}
        </div>
      ` : ''}
      ${item.specialInstructions ? `
        <div style="font-size: 13px; color: ${COLORS.muted}; font-style: italic; margin-top: 4px;">
          Note: ${item.specialInstructions}
        </div>
      ` : ''}
    </td>
    <td style="padding: 16px 0; text-align: right; border-bottom: 1px solid ${COLORS.border}; font-weight: 500; color: ${COLORS.foreground};">
      $${item.totalPrice.toFixed(2)}
    </td>
  </tr>
`).join('')

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const trackOrderUrl = `${APP_URL}/track-order?orderNumber=${encodeURIComponent(data.orderNumber)}&email=${encodeURIComponent(data.customerEmail)}`

    const content = `
    <div style="background: ${COLORS.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="background: ${COLORS.primary}; padding: 32px; text-align: center;">
        <h1 style="color: ${COLORS.white}; margin: 0; font-size: 24px; font-weight: 600;">Order Confirmed</h1>
      </div>

      <div style="padding: 32px;">
        <p style="font-size: 16px; margin: 0 0 24px 0; color: ${COLORS.foreground};">Hi ${data.customerName},</p>

        <p style="font-size: 16px; margin: 0 0 24px 0; color: ${COLORS.foreground};">Thank you for your order from <strong>${data.businessName}</strong>. Your order has been confirmed and we've received your payment.</p>

        <div style="background: ${COLORS.background}; padding: 20px; border-radius: 8px; margin: 24px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 4px 0; color: ${COLORS.muted}; font-size: 14px;">Order Number</td>
              <td style="padding: 4px 0; text-align: right; font-family: monospace; font-size: 14px; font-weight: 600; color: ${COLORS.foreground};">${data.orderNumber}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: ${COLORS.muted}; font-size: 14px;">Date</td>
              <td style="padding: 4px 0; text-align: right; font-size: 14px; color: ${COLORS.foreground};">${new Date(data.orderDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: ${COLORS.muted}; font-size: 14px;">Status</td>
              <td style="padding: 4px 0; text-align: right; font-size: 14px; font-weight: 500; color: ${COLORS.primary};">Received</td>
            </tr>
          </table>
        </div>

        <h2 style="font-size: 16px; font-weight: 600; margin: 32px 0 16px 0; color: ${COLORS.foreground};">Order Details</h2>

        <table style="width: 100%; border-collapse: collapse;">
          ${getItemsHtml(data.items)}
          <tr>
            <td style="padding: 16px 0; font-weight: 600; font-size: 16px; color: ${COLORS.foreground};">Total</td>
            <td style="padding: 16px 0; text-align: right; font-weight: 600; font-size: 18px; color: ${COLORS.foreground};">$${data.total.toFixed(2)}</td>
          </tr>
        </table>

        <div style="text-align: center; margin: 32px 0 24px 0;">
          <a href="${trackOrderUrl}" style="background: ${COLORS.primary}; color: ${COLORS.white}; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500; font-size: 15px;">
            Track Your Order
          </a>
        </div>

        <p style="font-size: 14px; color: ${COLORS.muted}; margin: 24px 0 0 0; padding-top: 24px; border-top: 1px solid ${COLORS.border};">
          If you have any questions, please contact ${data.businessName} directly.
        </p>
      </div>
    </div>
    `

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Order Confirmed - ${data.orderNumber}`,
      html: getEmailWrapper(content),
    })

    return { success: true, id: result.data?.id }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Send order status update email to customer (when order is ready)
 */
export async function sendOrderStatusUpdateEmail(data: OrderEmailData) {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: 'Email service not configured' }
  }

  if (!data.orderStatus || data.orderStatus !== 'ready') {
    return { success: false, error: 'Order status must be ready' }
  }

  try {
    const trackOrderUrl = `${APP_URL}/track-order?orderNumber=${encodeURIComponent(data.orderNumber)}&email=${encodeURIComponent(data.customerEmail)}`

    const content = `
    <div style="background: ${COLORS.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="background: ${COLORS.success}; padding: 32px; text-align: center;">
        <h1 style="color: ${COLORS.white}; margin: 0; font-size: 24px; font-weight: 600;">Your Order is Ready</h1>
      </div>

      <div style="padding: 32px;">
        <p style="font-size: 16px; margin: 0 0 24px 0; color: ${COLORS.foreground};">Hi ${data.customerName},</p>

        <p style="font-size: 16px; margin: 0 0 24px 0; color: ${COLORS.foreground};">Great news! Your order from <strong>${data.businessName}</strong> is ready for pickup.</p>

        <div style="background: #f0fdf4; border: 2px solid ${COLORS.success}; padding: 20px; border-radius: 8px; margin: 24px 0; text-align: center;">
          <div style="font-size: 14px; color: ${COLORS.muted}; margin-bottom: 4px;">Order Number</div>
          <div style="font-family: monospace; font-size: 20px; font-weight: 600; color: ${COLORS.foreground};">${data.orderNumber}</div>
          <div style="margin-top: 12px; font-weight: 600; color: ${COLORS.success}; font-size: 16px;">Ready for Pickup</div>
        </div>

        <div style="text-align: center; margin: 32px 0 24px 0;">
          <a href="${trackOrderUrl}" style="background: ${COLORS.success}; color: ${COLORS.white}; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500; font-size: 15px;">
            View Order Details
          </a>
        </div>

        <p style="font-size: 14px; color: ${COLORS.muted}; margin: 24px 0 0 0; padding-top: 24px; border-top: 1px solid ${COLORS.border};">
          If you have any questions, please contact ${data.businessName} directly.
        </p>
      </div>
    </div>
    `

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Your Order is Ready - ${data.orderNumber}`,
      html: getEmailWrapper(content),
    })

    return { success: true, id: result.data?.id }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Send order refund/cancellation email to customer
 */
export async function sendOrderRefundEmail(data: OrderEmailData) {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const trackOrderUrl = `${APP_URL}/track-order?orderNumber=${encodeURIComponent(data.orderNumber)}&email=${encodeURIComponent(data.customerEmail)}`

    const content = `
    <div style="background: ${COLORS.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="background: ${COLORS.secondary}; padding: 32px; text-align: center;">
        <h1 style="color: ${COLORS.white}; margin: 0; font-size: 24px; font-weight: 600;">Order Cancelled & Refunded</h1>
      </div>

      <div style="padding: 32px;">
        <p style="font-size: 16px; margin: 0 0 24px 0; color: ${COLORS.foreground};">Hi ${data.customerName},</p>

        <p style="font-size: 16px; margin: 0 0 24px 0; color: ${COLORS.foreground};">Your order from <strong>${data.businessName}</strong> has been cancelled and a refund has been processed.</p>

        <div style="background: ${COLORS.background}; padding: 20px; border-radius: 8px; margin: 24px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 4px 0; color: ${COLORS.muted}; font-size: 14px;">Order Number</td>
              <td style="padding: 4px 0; text-align: right; font-family: monospace; font-size: 14px; font-weight: 600; color: ${COLORS.foreground};">${data.orderNumber}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: ${COLORS.muted}; font-size: 14px;">Refund Amount</td>
              <td style="padding: 4px 0; text-align: right; font-size: 16px; font-weight: 600; color: ${COLORS.foreground};">$${data.total.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: ${COLORS.muted}; font-size: 14px;">Status</td>
              <td style="padding: 4px 0; text-align: right; font-size: 14px; font-weight: 500; color: ${COLORS.secondary};">Refunded</td>
            </tr>
          </table>
        </div>

        <div style="background: #f0f9ff; border-left: 4px solid ${COLORS.secondary}; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; font-size: 14px; color: ${COLORS.foreground};">
            <strong>Refund Timeline:</strong> The refund will appear in your original payment method within 5-10 business days, depending on your bank.
          </p>
        </div>

        <div style="text-align: center; margin: 32px 0 24px 0;">
          <a href="${trackOrderUrl}" style="background: ${COLORS.secondary}; color: ${COLORS.white}; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500; font-size: 15px;">
            View Order Details
          </a>
        </div>

        <p style="font-size: 14px; color: ${COLORS.muted}; margin: 24px 0 0 0; padding-top: 24px; border-top: 1px solid ${COLORS.border};">
          If you have any questions about this refund, please contact ${data.businessName} directly.
        </p>
      </div>
    </div>
    `

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Order Cancelled & Refunded - ${data.orderNumber}`,
      html: getEmailWrapper(content),
    })

    return { success: true, id: result.data?.id }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Send item refund email to customer (for individual item refunds)
 */
export async function sendItemRefundEmail(data: OrderEmailData & { refundedItemName: string; refundAmount: number }) {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const trackOrderUrl = `${APP_URL}/track-order?orderNumber=${encodeURIComponent(data.orderNumber)}&email=${encodeURIComponent(data.customerEmail)}`

    const content = `
    <div style="background: ${COLORS.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="background: ${COLORS.secondary}; padding: 32px; text-align: center;">
        <h1 style="color: ${COLORS.white}; margin: 0; font-size: 24px; font-weight: 600;">Item Refunded</h1>
      </div>

      <div style="padding: 32px;">
        <p style="font-size: 16px; margin: 0 0 24px 0; color: ${COLORS.foreground};">Hi ${data.customerName},</p>

        <p style="font-size: 16px; margin: 0 0 24px 0; color: ${COLORS.foreground};">An item from your order at <strong>${data.businessName}</strong> has been refunded.</p>

        <div style="background: ${COLORS.background}; padding: 20px; border-radius: 8px; margin: 24px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 4px 0; color: ${COLORS.muted}; font-size: 14px;">Order Number</td>
              <td style="padding: 4px 0; text-align: right; font-family: monospace; font-size: 14px; font-weight: 600; color: ${COLORS.foreground};">${data.orderNumber}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: ${COLORS.muted}; font-size: 14px;">Refunded Item</td>
              <td style="padding: 4px 0; text-align: right; font-size: 14px; font-weight: 500; color: ${COLORS.foreground};">${data.refundedItemName}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: ${COLORS.muted}; font-size: 14px;">Refund Amount</td>
              <td style="padding: 4px 0; text-align: right; font-size: 16px; font-weight: 600; color: ${COLORS.foreground};">$${data.refundAmount.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <div style="background: #f0f9ff; border-left: 4px solid ${COLORS.secondary}; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; font-size: 14px; color: ${COLORS.foreground};">
            <strong>Refund Timeline:</strong> The refund will appear in your original payment method within 5-10 business days, depending on your bank.
          </p>
        </div>

        <div style="text-align: center; margin: 32px 0 24px 0;">
          <a href="${trackOrderUrl}" style="background: ${COLORS.secondary}; color: ${COLORS.white}; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500; font-size: 15px;">
            View Order Details
          </a>
        </div>

        <p style="font-size: 14px; color: ${COLORS.muted}; margin: 24px 0 0 0; padding-top: 24px; border-top: 1px solid ${COLORS.border};">
          If you have any questions about this refund, please contact ${data.businessName} directly.
        </p>
      </div>
    </div>
    `

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Item Refunded - ${data.orderNumber}`,
      html: getEmailWrapper(content),
    })

    return { success: true, id: result.data?.id }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
