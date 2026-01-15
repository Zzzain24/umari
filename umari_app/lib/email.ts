import { Resend } from 'resend'
import type { CartItem } from './types'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://umari.app'

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

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const trackOrderUrl = `${APP_URL}/track-order?orderNumber=${encodeURIComponent(data.orderNumber)}&email=${encodeURIComponent(data.customerEmail)}`

    const itemsHtml = data.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <strong>${item.quantity}x ${item.itemName}</strong>
          ${item.selectedOptions && item.selectedOptions.length > 0 ? `
            <div style="font-size: 14px; color: #6b7280; margin-top: 4px;">
              ${item.selectedOptions.map(opt => `${opt.optionName}: ${opt.selectedValue}${opt.additionalPrice > 0 ? ` (+$${opt.additionalPrice.toFixed(2)})` : ''}`).join('<br>')}
            </div>
          ` : ''}
          ${item.specialInstructions ? `
            <div style="font-size: 13px; color: #6b7280; font-style: italic; margin-top: 4px;">
              Note: ${item.specialInstructions}
            </div>
          ` : ''}
        </td>
        <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">
          $${item.totalPrice.toFixed(2)}
        </td>
      </tr>
    `).join('')

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Order Confirmed! 🎉</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi ${data.customerName},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">Thank you for your order from <strong>${data.businessName}</strong>! Your order has been confirmed and we've received your payment.</p>
    
    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <div style="margin-bottom: 12px;">
        <strong>Order Number:</strong> <span style="font-family: monospace; font-size: 16px;">${data.orderNumber}</span>
      </div>
      <div style="margin-bottom: 12px;">
        <strong>Order Date:</strong> ${new Date(data.orderDate).toLocaleString()}
      </div>
      <div>
        <strong>Status:</strong> <span style="text-transform: capitalize;">${data.orderStatus || 'Received'}</span>
      </div>
    </div>
    
    <h2 style="font-size: 20px; margin-top: 30px; margin-bottom: 16px; border-top: 2px solid #e5e7eb; padding-top: 20px;">Order Details</h2>
    
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      ${itemsHtml}
      <tr>
        <td style="padding: 12px; border-top: 2px solid #e5e7eb; text-align: right; font-weight: bold; font-size: 18px;">
          Total: $${data.total.toFixed(2)}
        </td>
      </tr>
    </table>
    
    <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0; font-size: 15px;">
        <strong>Track Your Order:</strong> You can track your order status anytime using your order number and email address.
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${trackOrderUrl}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
        Track Your Order
      </a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
      If you have any questions about your order, please contact ${data.businessName} directly.
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
    <p>Powered by Umari</p>
  </div>
</body>
</html>
    `

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Order Confirmed - ${data.orderNumber}`,
      html,
    })

    return { success: true, id: result.data?.id }
  } catch (error: any) {
    console.error('Failed to send order confirmation email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send order status update email to customer (when order is ready)
 */
export async function sendOrderStatusUpdateEmail(data: OrderEmailData) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email')
    return { success: false, error: 'Email service not configured' }
  }

  if (!data.orderStatus || data.orderStatus !== 'ready') {
    return { success: false, error: 'Order status must be ready' }
  }

  try {
    const trackOrderUrl = `${APP_URL}/track-order?orderNumber=${encodeURIComponent(data.orderNumber)}&email=${encodeURIComponent(data.customerEmail)}`

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Your Order is Ready! 🎉</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi ${data.customerName},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">Great news! Your order from <strong>${data.businessName}</strong> is ready for pickup.</p>
    
    <div style="background: #f0fdf4; border: 2px solid #10b981; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <div style="margin-bottom: 12px;">
        <strong>Order Number:</strong> <span style="font-family: monospace; font-size: 16px;">${data.orderNumber}</span>
      </div>
      <div>
        <strong>Status:</strong> <span style="text-transform: capitalize; font-weight: bold; color: #059669;">Ready</span>
      </div>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${trackOrderUrl}" style="background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
        View Order Details
      </a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
      If you have any questions, please contact ${data.businessName} directly.
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
    <p>Powered by Umari</p>
  </div>
</body>
</html>
    `

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Your Order is Ready! - ${data.orderNumber}`,
      html,
    })

    return { success: true, id: result.data?.id }
  } catch (error: any) {
    console.error('Failed to send order status update email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send order refund/cancellation email to customer
 */
export async function sendOrderRefundEmail(data: OrderEmailData) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const trackOrderUrl = `${APP_URL}/track-order?orderNumber=${encodeURIComponent(data.orderNumber)}&email=${encodeURIComponent(data.customerEmail)}`

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Order Refunded & Cancelled</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi ${data.customerName},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">Your order from <strong>${data.businessName}</strong> has been refunded and cancelled.</p>
    
    <div style="background: #fef2f2; border: 2px solid #ef4444; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <div style="margin-bottom: 12px;">
        <strong>Order Number:</strong> <span style="font-family: monospace; font-size: 16px;">${data.orderNumber}</span>
      </div>
      <div style="margin-bottom: 12px;">
        <strong>Refund Amount:</strong> <span style="font-weight: bold; font-size: 18px; color: #dc2626;">$${data.total.toFixed(2)}</span>
      </div>
      <div style="margin-bottom: 12px;">
        <strong>Payment Status:</strong> <span style="text-transform: capitalize;">Refunded</span>
      </div>
      <div>
        <strong>Order Status:</strong> <span style="text-transform: capitalize;">Cancelled</span>
      </div>
    </div>
    
    <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0; font-size: 15px;">
        <strong>Refund Processing:</strong> The refund has been processed and will appear in your original payment method within 5-10 business days, depending on your bank or card issuer.
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${trackOrderUrl}" style="background: #ef4444; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
        View Order Details
      </a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
      If you have any questions about this refund, please contact ${data.businessName} directly.
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
    <p>Powered by Umari</p>
  </div>
</body>
</html>
    `

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Order Refunded & Cancelled - ${data.orderNumber}`,
      html,
    })

    return { success: true, id: result.data?.id }
  } catch (error: any) {
    console.error('Failed to send order refund email:', error)
    return { success: false, error: error.message }
  }
}
