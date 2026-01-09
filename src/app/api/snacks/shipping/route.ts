import { NextRequest, NextResponse } from "next/server";
import { checkServiceability } from "@/lib/shiprocket";

const PICKUP_PINCODE = process.env.PICKUP_PINCODE || "600001"; // Default Chennai

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { pincode, weight } = body;

        if (!pincode || !weight) {
            return NextResponse.json({ error: "Missing pincode or weight" }, { status: 400 });
        }

        const result = await checkServiceability({
            pickupPostcode: PICKUP_PINCODE,
            deliveryPostcode: pincode,
            weight: parseFloat(weight),
            cod: 0, // Prepaid only
        });

        // Extract available couriers and find the cheapest rate
        const couriers = result.data?.available_courier_companies || [];

        if (couriers.length === 0) {
            return NextResponse.json({
                error: "No courier available for this pincode",
                available: false
            }, { status: 200 });
        }

        // Find cheapest rate
        const cheapestCourier = couriers.reduce((min: any, courier: any) => {
            const rate = parseFloat(courier.rate || courier.freight_charge || 0);
            const minRate = parseFloat(min.rate || min.freight_charge || Infinity);
            return rate < minRate ? courier : min;
        }, couriers[0]);

        const shippingCost = parseFloat(cheapestCourier.rate || cheapestCourier.freight_charge || 0);

        return NextResponse.json({
            available: true,
            shippingCost: Math.ceil(shippingCost),
            courierName: cheapestCourier.courier_name,
            etd: cheapestCourier.etd,
        });
    } catch (error) {
        console.error("Shipping API Error:", error);
        return NextResponse.json({
            error: "Failed to calculate shipping",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
