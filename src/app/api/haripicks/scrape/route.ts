import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        // Fetch the page with a browser-like User-Agent
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
            },
        });

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to fetch the URL" }, { status: 500 });
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Extract metadata
        const title =
            $('meta[property="og:title"]').attr("content") ||
            $('meta[name="twitter:title"]').attr("content") ||
            $("title").text() ||
            "";

        const description =
            $('meta[property="og:description"]').attr("content") ||
            $('meta[name="twitter:description"]').attr("content") ||
            $('meta[name="description"]').attr("content") ||
            "";

        const image =
            $('meta[property="og:image"]').attr("content") ||
            $('meta[name="twitter:image"]').attr("content") ||
            "";

        // Try to guess platform
        let platform = "other";
        if (url.includes("amazon")) platform = "amazon";
        else if (url.includes("flipkart")) platform = "flipkart";

        // Price extraction (very basic attempt) - often requires specific selectors per site
        // This is a naive implementation and might need refinement for specific stores
        let price = "";
        if (platform === "amazon") {
            price = $(".a-price-whole").first().text().replace(/[^\d.]/g, "");
        } else if (platform === "flipkart") {
            price = $("._30jeq3._16Jk6d").first().text().replace(/[^\d.]/g, "");
        }

        return NextResponse.json({
            title: title.trim(),
            description: description.trim(),
            image: image,
            platform,
            price: price || null
        });
    } catch (error) {
        console.error("Scraping error:", error);
        return NextResponse.json({ error: "Failed to parse the page" }, { status: 500 });
    }
}
