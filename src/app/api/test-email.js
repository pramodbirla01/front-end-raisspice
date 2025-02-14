
import { testEmailConnection, sendEmail } from '@/utils/emailService';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Test SMTP connection
        const connectionResult = await testEmailConnection();
        if (!connectionResult.success) {
            throw new Error(`SMTP connection failed: ${connectionResult.error}`);
        }

        // Send test email
        const result = await sendEmail(
            process.env.SMTP_USER, // Send to yourself
            'Test Email',
            '<h1>Test Email</h1><p>This is a test email to verify SMTP configuration.</p>'
        );

        return res.status(200).json({ success: true, result });
    } catch (error) {
        console.error('Email test failed:', error);
        return res.status(500).json({ error: error.message });
    }
}