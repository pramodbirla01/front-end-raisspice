import SibApiV3Sdk from "sib-api-v3-sdk";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const brevoClient = SibApiV3Sdk.ApiClient.instance;
  const apiKey = brevoClient.authentications["api-key"];
  apiKey.apiKey = process.env.BREVO_API_KEY;

  const emailContent = {
    to: [{ email }],
    sender: {
      email: process.env.OWNER_EMAIL,
      name: "Sanurri",
    },
    subject: "Welcome to Sanurri!",
    htmlContent: `
      <h1>Welcome to Sanurri Perks!</h1>
      <h3>Thank you for subscribing to our newsletter. 🎉<br> Stay tuned for updates, perks, and more!</h3>
      <p>Best regards✨<br>The Sanurri Team</p>
    `,
  };

  try {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    await apiInstance.sendTransacEmail(emailContent);

    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ message: "Failed to send email." });
  }
}
