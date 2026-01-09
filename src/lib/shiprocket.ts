const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;

// Helper to get authenticated token
export async function getShiprocketToken() {
    if (!SHIPROCKET_EMAIL || !SHIPROCKET_PASSWORD) {
        throw new Error("Shiprocket credentials missing");
    }

    const response = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: SHIPROCKET_EMAIL,
            password: SHIPROCKET_PASSWORD,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        console.error("Shiprocket Login Failed:", error);
        throw new Error("Failed to authenticate with Shiprocket");
    }

    const data = await response.json();
    return data.token;
}

// Create Order in Shiprocket
export async function createShiprocketOrder(orderData: any) {
    const token = await getShiprocketToken();

    const response = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
    });

    const result = await response.json();

    if (!response.ok) {
        console.error("Shiprocket Create Order Failed:", result);
        throw new Error(result.message || "Failed to create order in Shiprocket");
    }

    return result;
}

// Generate AWB (if not auto-assigned)
export async function generateAWB(shipmentId: string) {
    const token = await getShiprocketToken();

    const response = await fetch("https://apiv2.shiprocket.in/v1/external/courier/assign/awb", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
            shipment_id: shipmentId,
        }),
    });

    const result = await response.json();

    if (!response.ok) {
        console.error("Shiprocket AWB Generation Failed:", result);
        throw new Error(result.message || "Failed to generate AWB");
    }

    return result;
}

// Check Serviceability and Get Shipping Rates
export async function checkServiceability(params: {
    pickupPostcode: string;
    deliveryPostcode: string;
    weight: number;
    cod: 0 | 1;
}) {
    const token = await getShiprocketToken();

    const response = await fetch("https://apiv2.shiprocket.in/v1/external/courier/serviceability/", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
    });

    const queryParams = new URLSearchParams({
        pickup_postcode: params.pickupPostcode,
        delivery_postcode: params.deliveryPostcode,
        weight: params.weight.toString(),
        cod: params.cod.toString(),
    });

    const serviceabilityResponse = await fetch(
        `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?${queryParams}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        }
    );

    const result = await serviceabilityResponse.json();

    if (!serviceabilityResponse.ok) {
        console.error("Shiprocket Serviceability Check Failed:", result);
        throw new Error(result.message || "Failed to check serviceability");
    }

    return result;
}
