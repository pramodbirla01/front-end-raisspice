import { generateOrderConfirmationEmail, sendEmail, testEmailConnection } from '@/utils/emailService';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { order } = req.body;

        // Validate order data
        if (!order || !order.email) {
            console.error('Invalid order data:', order);
            return res.status(400).json({ error: 'Missing order details' });
        }

        // Test email connection first
        const connectionTest = await testEmailConnection();
        if (!connectionTest.success) {
            throw new Error(`SMTP connection failed: ${connectionTest.error}`);
        }

        console.log('Generating email for order:', order.$id);
        const emailHtml = generateOrderConfirmationEmail(order);

        console.log('Sending email to:', order.email);
        const result = await sendEmail(
            order.email,
            `Order Confirmation - #${order.$id}`,
            emailHtml
        );

        return res.status(200).json({ success: true, messageId: result.messageId });
    } catch (error) {
        console.error('Failed to send order confirmation email:', error);
        return res.status(500).json({ 
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
