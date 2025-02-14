import { verifyOTP } from '@/utils/otpService';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, otp } = req.body;
        
        console.log('Received verification request:', { email, otp });

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        // Ensure OTP is numeric and 4 digits
        const numericOTP = parseInt(otp);
        if (isNaN(numericOTP) || numericOTP < 1000 || numericOTP > 9999) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP format'
            });
        }

        const isValid = await verifyOTP(email, numericOTP);
        console.log('Verification result:', isValid);

        if (isValid) {
            return res.status(200).json({
                success: true,
                message: 'OTP verified successfully',
                redirectUrl: `/reset-password?email=${encodeURIComponent(email)}&otp=${otp}`
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

    } catch (error) {
        console.error('OTP verification error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to verify OTP',
            details: error.message
        });
    }
}
