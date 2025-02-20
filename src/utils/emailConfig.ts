import nodemailer from 'nodemailer';

// Validate email configuration
const validateEmailConfig = () => {
  const requiredVars = [
    'SMTP_HOST',
    'SMTP_PORT',
    'EMAIL_USER',
    'EMAIL_PASS',
    'EMAIL_FROM'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  if (missing.length > 0) {
    throw new Error(`Missing required email configuration: ${missing.join(', ')}`);
  }
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: process.env.NODE_ENV === 'development', // Enable debug logs in development
});

export async function verifyEmailConfig(): Promise<boolean> {
  try {
    console.log('Verifying email configuration with host:', process.env.SMTP_HOST);
    console.log('Using email:', process.env.EMAIL_USER);
    
    // Test the connection
    await transporter.verify();
    console.log('Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('Email configuration verification failed:', error);
    return false;
  }
}

export async function sendResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendOrderConfirmationEmail(
  email: string, 
  orderDetails: {
    orderId: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    totalAmount: number;
    shippingAddress: {
      full_name: string;
      address_line1: string;
      city: string;
      state: string;
      pincode: string;
    };
  }
) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Order Confirmation - #${orderDetails.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #9B2C2C; text-align: center;">Order Confirmation</h1>
        <p>Dear ${orderDetails.shippingAddress.full_name},</p>
        <p>Thank you for your order! We're pleased to confirm that your order has been received and is being processed.</p>
        
        <div style="background-color: #f8f8f8; padding: 20px; margin: 20px 0;">
          <h2 style="color: #333;">Order Details</h2>
          <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
          
          <h3 style="color: #666;">Items Ordered:</h3>
          <ul style="list-style: none; padding: 0;">
            ${orderDetails.items.map(item => `
              <li style="margin-bottom: 10px;">
                ${item.name} x ${item.quantity} - ₹${item.price}
              </li>
            `).join('')}
          </ul>
          
          <p style="font-size: 18px; margin-top: 20px;">
            <strong>Total Amount:</strong> ₹${orderDetails.totalAmount}
          </p>
        </div>
        
        <div style="background-color: #f8f8f8; padding: 20px; margin: 20px 0;">
          <h3 style="color: #666;">Shipping Address:</h3>
          <p>
            ${orderDetails.shippingAddress.full_name}<br>
            ${orderDetails.shippingAddress.address_line1}<br>
            ${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state}<br>
            ${orderDetails.shippingAddress.pincode}
          </p>
        </div>
        
        <p>We will send you another email when your order ships.</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <p>If you have any questions, please contact us at ${process.env.EMAIL_USER}</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendOrderCancellationEmail(
  email: string,
  orderDetails: {
    orderId: string;
    refundDetails?: {
      refund_id: string;
      refund_status: string;
      refund_amount: number;
      refund_due?: string;
    };
    items: Array<{ name: string; quantity: number; price: number }>;
    totalAmount: number;
  }
) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Order Cancellation Confirmation - #${orderDetails.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #9B2C2C; text-align: center;">Order Cancellation Confirmation</h1>
        <p>Your order #${orderDetails.orderId} has been successfully cancelled.</p>
        
        <div style="background-color: #f8f8f8; padding: 20px; margin: 20px 0;">
          <h2 style="color: #333;">Cancelled Order Details</h2>
          <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
          
          ${orderDetails.refundDetails ? `
            <div style="background-color: #fff; padding: 15px; margin: 10px 0; border-left: 4px solid #9B2C2C;">
              <h3 style="color: #333; margin-top: 0;">Refund Information</h3>
              <p><strong>Refund ID:</strong> ${orderDetails.refundDetails.refund_id}</p>
              <p><strong>Refund Status:</strong> ${orderDetails.refundDetails.refund_status}</p>
              <p><strong>Refund Amount:</strong> ₹${orderDetails.refundDetails.refund_amount}</p>
              ${orderDetails.refundDetails.refund_due ? `
                <p><strong>Expected Refund Date:</strong> ${new Date(orderDetails.refundDetails.refund_due).toLocaleDateString()}</p>
              ` : ''}
            </div>
          ` : ''}
          
          <h3 style="color: #666;">Cancelled Items:</h3>
          <ul style="list-style: none; padding: 0;">
            ${orderDetails.items.map(item => `
              <li style="margin-bottom: 10px;">
                ${item.name} x ${item.quantity} - ₹${item.price}
              </li>
            `).join('')}
          </ul>
          
          <p style="font-size: 18px; margin-top: 20px;">
            <strong>Total Amount:</strong> ₹${orderDetails.totalAmount}
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p>If you have any questions about your cancellation or refund, please contact us at ${process.env.EMAIL_USER}</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export { transporter };
