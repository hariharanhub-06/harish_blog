import nodemailer from "nodemailer";

interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
    // These environment variables should be configured in your .env file
    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const isSecure = smtpPort === 465 || process.env.SMTP_SECURE === "true";

    console.log(`Setting up SMTP transporter for ${process.env.SMTP_HOST} on port ${smtpPort} (Secure: ${isSecure})`);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: smtpPort,
        secure: isSecure,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        // Standard timeout settings for better reliability
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
    });

    try {
        console.log(`Sending email to: ${to} | Subject: ${subject}`);
        console.log(`Content Length - Text: ${text?.length || 0}, HTML: ${html?.length || 0}`);

        const info = await transporter.sendMail({
            from: `"Hari Haran J" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html,
        });
        console.log("Email sent: %s", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error };
    }
}
