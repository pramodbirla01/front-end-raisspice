import { sendEmail } from '@/utils/emailService';  // Change import to emailService

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { recipient, subject, htmlTemplate } = req.body;

        // Enhanced validation
        if (!recipient) throw new Error('Recipient email is required');
        if (!subject) throw new Error('Email subject is required');
        if (!htmlTemplate) throw new Error('Email content is required');

        const result = await sendEmail(recipient, subject, htmlTemplate);
        return res.status(200).json(result);

    } catch (error) {
        console.error('Email sending error:', error);
        return res.status(500).json({ 
            error: 'Failed to send message',
            details: error.message
        });
    }
}
