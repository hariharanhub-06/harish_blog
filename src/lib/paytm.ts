import PaytmChecksum from "paytmchecksum";

const PAYTM_MID = process.env.PAYTM_MID;
const PAYTM_MERCHANT_KEY = process.env.PAYTM_MERCHANT_KEY;
const PAYTM_WEBSITE = process.env.PAYTM_WEBSITE || "DEFAULT";
const PAYTM_ENVIRONMENT = process.env.NODE_ENV === "production" ? "PROD" : "STAGING";

export class PaytmUtil {
    /**
     * Generate Paytm Checksum for a transaction request
     */
    static async generateChecksum(params: any) {
        if (!PAYTM_MERCHANT_KEY) throw new Error("Missing PAYTM_MERCHANT_KEY");
        return PaytmChecksum.generateSignature(JSON.stringify(params), PAYTM_MERCHANT_KEY);
    }

    /**
     * Verify Paytm Checksum from a response
     */
    static async verifyChecksum(params: any, checksum: string) {
        if (!PAYTM_MERCHANT_KEY) throw new Error("Missing PAYTM_MERCHANT_KEY");
        return PaytmChecksum.verifySignature(JSON.stringify(params), PAYTM_MERCHANT_KEY, checksum);
    }

    /**
     * Get the transaction status from Paytm
     */
    static async getTransactionStatus(orderId: string) {
        const paytmParams: any = {};
        paytmParams["MID"] = PAYTM_MID;
        paytmParams["ORDERID"] = orderId;

        const checksum = await PaytmChecksum.generateSignature(JSON.stringify(paytmParams), PAYTM_MERCHANT_KEY!);
        paytmParams["CHECKSUMHASH"] = checksum;

        const post_data = JSON.stringify(paytmParams);
        const url = PAYTM_ENVIRONMENT === "PROD"
            ? "https://securegw.paytm.in/v3/order/status"
            : "https://securegw-stage.paytm.in/v3/order/status";

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": post_data.length.toString(),
            },
            body: post_data,
        });

        return response.json();
    }
}
