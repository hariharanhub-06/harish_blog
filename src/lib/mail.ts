import nodemailer from "nodemailer";

interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
    // These environment variables should be configured in your .env file
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        const info = await transporter.sendMail({
            from: `"HM Snacks Partner Family" <${process.env.SMTP_USER}>`,
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

export async function sendAffiliateCredentialsEmail(email: string, fullName: string, couponCode: string, password: string) {
    const dashboardLink = "https://hariharanhub.com/business/hm-snacks/affiliate/login";
    const groupLink = "https://chat.whatsapp.com/K0tb3d13w77CIcaW7FRU3t";

    const subject = "🎉 Welcome to HM Snacks Partner Family! Your Credentials Inside";

    const text = `Hi ${fullName},

Congratulations! Your HM Snacks Affiliate Application has been Approved.

Welcome to the HM Snacks Partner Family! 🍪

📌 Your Official Code: ${couponCode}
🔐 Your Login Password: ${password}

🚀 Access Your Partner Dashboard:
${dashboardLink}
(Login with your Registered Mobile Number & password)

💰 Your Commission Plan:
- Direct Sales: Starting at 6% (Up to 20%)
- Level 1 Downline: 2.0%
- Level 2 Downline: 1.8%
- Level 3 Downline: 1.6%

Join our exclusive WhatsApp Partner Community:
${groupLink}

Start promoting and tracking your binary team growth today! 🚀

Best regards,
Team HM Snacks`;

    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #F97316; text-align: center;">Welcome to HM Snacks Partner Family! 🍪</h2>
            <p>Hi <b>${fullName}</b>,</p>
            <p>Congratulations! Your HM Snacks Affiliate Application has been <b>Approved</b>.</p>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <p style="margin: 0;">📌 Your Official Code: <b style="font-size: 1.2em; color: #DB2777;">${couponCode}</b></p>
                <p style="margin: 10px 0 0;">🔐 Your Login Password: <b>${password}</b></p>
            </div>

            <p>🚀 <b>Access Your Partner Dashboard:</b><br>
            <a href="${dashboardLink}" style="display: inline-block; background-color: #F97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; margin-top: 10px;">Go to Dashboard</a><br>
            <small>(Login with your Registered Mobile Number & password)</small></p>

            <h3 style="color: #4B5563;">💰 Your Commission Plan:</h3>
            <ul>
                <li>Direct Sales: Starting at 6% (Up to 20%)</li>
                <li>Level 1 Downline: 2.0%</li>
                <li>Level 2 Downline: 1.8%</li>
                <li>Level 3 Downline: 1.6%</li>
            </ul>

            <p>Join our exclusive WhatsApp Partner Community:<br>
            <a href="${groupLink}" style="color: #059669; font-weight: bold;">WhatsApp Group Link</a></p>

            <p style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                Start promoting and tracking your binary team growth today! 🚀<br><br>
                Best regards,<br>
                <b>Team HM Snacks</b>
            </p>
        </div>
    `;

    return sendEmail({ to: email, subject, text, html });
}
