import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";
import { snackOrders } from "@/db/schema";
import { eq } from "drizzle-orm";

// PhonePe Sandbox Credentials
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "PGTESTPAYUAT";
const SALT_KEY = process.env.PHONEPE_SALT_KEY || "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";
const PHONEPE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox"; // Sandbox URL

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { amount, orderId, mobile, redirectUrl } = body;

        if (!amount || !orderId || !mobile) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Construct Payload
        const payload = {
            merchantId: MERCHANT_ID,
            merchantTransactionId: orderId,
            merchantUserId: "MUID-" + mobile,
            amount: amount * 100, // Amount in paise
            redirectUrl: redirectUrl || `https://snack-muruku.vercel.app/business/hm-snacks/track`, // Default fallback
            redirectMode: "REDIRECT",
            callbackUrl: `https://snack-muruku.vercel.app/api/payment/webhook`, // Production URL
            mobileNumber: mobile,
            paymentInstrument: {
                type: "PAY_PAGE"
            }
        };

        // Encode Payload to Base64
        const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");

        // Calculate Checksum: sha256(base64Payload + "/pg/v1/pay" + saltKey) + ### + saltIndex
        const stringToHash = base64Payload + "/pg/v1/pay" + SALT_KEY;
        const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
        const checksum = sha256 + "###" + SALT_INDEX;

        // Make Request to PhonePe
        const options = {
            method: "POST",
            headers: {
                accept: "application/json",
                "Content-Type": "application/json",
                "X-VERIFY": checksum
            },
            body: JSON.stringify({
                request: base64Payload
            })
        };

        const response = await fetch(`${PHONEPE_HOST_URL}/pg/v1/pay`, options);
        const data = await response.json();

        if (data.success) {
            return NextResponse.json({
                success: true,
                url: data.data.instrumentResponse.redirectInfo.url,
                orderId: orderId
            });
        } else {
            console.error("PhonePe Error:", data);
            return NextResponse.json({ error: data.message || "Payment initiation failed" }, { status: 400 });
        }

    } catch (error) {
        console.error("Payment API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
