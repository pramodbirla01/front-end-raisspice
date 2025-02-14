import { sendEmail } from '@/utils/emailService';  // Using nodemailer service instead of Appwrite
import { generateOTP, saveOTP } from '@/utils/otpService';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email } = req.body;
        if (!email) throw new Error('Email is required');

        // Generate OTP
        const otp = generateOTP();

        // First try to save OTP to Appwrite
        await saveOTP(email, otp);

        // Send OTP email using nodemailer
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p>Your OTP for password reset is: <strong>${otp}</strong></p>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <br>
                <p>Best regards,<br>Sanurri Rugs Team</p>
            </div>
        `;

        const emailResult = await sendEmail(
            email,
            'Password Reset OTP - Sanurri Rugs',
            htmlContent
        );

        console.log('Email sent successfully:', emailResult);

        return res.status(200).json({ 
            success: true,
            message: 'OTP sent successfully'
        });

    } catch (error) {
        console.error('OTP sending error:', error);
        return res.status(500).json({ 
            error: 'Failed to send OTP',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
