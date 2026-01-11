import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
    try {
        // 1. Create Vendors Table
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS vendors (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                phone TEXT,
                pickup_location_id TEXT, 
                address TEXT,
                bank_details JSONB,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // 2. Link Products to Vendors
        // Check if column exists first to avoid error
        await db.execute(sql`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='snack_products' AND column_name='vendor_id') THEN 
                    ALTER TABLE snack_products ADD COLUMN vendor_id UUID REFERENCES vendors(id); 
                END IF; 
            END $$;
        `);

        // 3. Create Order Shipments Table
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS order_shipments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                order_id TEXT NOT NULL, -- Logical link, not strict FK to avoid issues if order table structure varies slightly or order_id isn't unique constraint in some legacy setups (though it should be)
                vendor_id UUID REFERENCES vendors(id),
                shiprocket_order_id TEXT,
                awb_code TEXT,
                courier_name TEXT,
                tracking_url TEXT,
                status TEXT DEFAULT 'Pending',
                items JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        return NextResponse.json({ success: true, message: "Multi-Vendor Tables Setup Complete" });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
