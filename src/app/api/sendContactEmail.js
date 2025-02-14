import SibApiV3Sdk from 'sib-api-v3-sdk';

const sendContactEmail = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, phone, message } = req.body;

  if (!email || !message) {
    return res.status(400).json({ message: "Email and message are required" });
  }

  const client = SibApiV3Sdk.ApiClient.instance;
  const apiKey = client.authentications["api-key"];
  apiKey.apiKey = process.env.BREVO_API_KEY;

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  const sendSmtpEmail = {
    to: [{ email: "prmdbirla65@gmail.com" }], // Owner's email
    sender: { email: "prmdbirla65@gmail.com", name: "Sanurri - Contact us!" },
    subject: `Contact Message from ${name}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #4CAF50;">You have received a new message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "N/A"}</p>
        <p><strong>Message:</strong></p>
        <div style="border: 1px solid #ddd; padding: 10px; background-color: #f9f9f9;">
          ${message}
        </div>
      </div>
    `,
  };

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    return res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error sending contact email:", error);
    return res.status(500).json({ message: "Failed to send message" });
  }
};

export default sendContactEmail;
