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
        let title =
            $('meta[property="og:title"]').attr("content") ||
            $('meta[name="twitter:title"]').attr("content") ||
            $("title").text() ||
            "";

        let description =
            $('meta[property="og:description"]').attr("content") ||
            $('meta[name="twitter:description"]').attr("content") ||
            $('meta[name="description"]').attr("content") ||
            "";

        if (description.includes("Amazon.in")) {
            description = description.split("Amazon.in")[0].replace(/[:|\-]$/, "").trim();
        } else if (description.includes("Flipkart.com")) {
            description = description.split("Flipkart.com")[0].replace(/[:|\-]$/, "").trim();
        }

        let image =
            $('meta[property="og:image"]').attr("content") ||
            $('meta[name="twitter:image"]').attr("content") ||
            "";

        // Try to guess platform
        let platform = "other";
        if (url.includes("amazon")) platform = "amazon";
        else if (url.includes("flipkart")) platform = "flipkart";

        // Platform-specific enhancements
        let price = "";

        if (platform === "amazon") {
            // Price: prioritize deal price if available
            price =
                $(".a-price.priceToPay .a-price-whole").first().text() ||
                $(".a-price-whole").first().text() ||
                $(".a-price .a-offscreen").first().text() ||
                $("#priceblock_ourprice").text() ||
                $("#priceblock_dealprice").text() ||
                $("#kindle-price").text() ||
                $("#price").text();

            price = price.replace(/[^\d.]/g, "");

            // Image: Amazon often has multiple images, try to get the main one
            const landingImage = $("#landingImage");
            const dynamicImageAttr = landingImage.attr("data-a-dynamic-image");

            if (dynamicImageAttr) {
                try {
                    // This is a JSON string of URL -> [width, height]
                    const images = JSON.parse(dynamicImageAttr);
                    const urls = Object.keys(images);
                    if (urls.length > 0) {
                        // Usually the first one is the best, or we could find the largest
                        image = urls.reduce((prev, curr) => images[curr][0] > images[prev][0] ? curr : prev);
                    }
                } catch (e) {
                    image = landingImage.attr("src") || image;
                }
            } else {
                image = landingImage.attr("src") || $("#imgBlkFront").attr("src") || $("#main-image").attr("src") || image;
            }

            // CDN fallback for Amazon
            if (!image) {
                image = $('img[src*="media-amazon.com/images/I/"]').first().attr("src") || "";
            }
        } else if (platform === "flipkart") {
            // Price
            price = $("._30jeq3._16Jk6d").first().text() || $("._30jeq3").first().text();
            price = price.replace(/[^\d.]/g, "");

            // Image: Flipkart specific
            const flipkartImg = $("img._396cs4").attr("src") || $("img._2r_T1I").attr("src") || $('img[alt="product"]').attr("src");
            if (flipkartImg) image = flipkartImg;
        }

        // Clean up relative URLs
        if (image && image.startsWith("//")) {
            image = "https:" + image;
        } else if (image && image.startsWith("/")) {
            try {
                const baseUrl = new URL(url);
                image = baseUrl.origin + image;
            } catch (e) { }
        }

        console.log(`[Scraper] Found - Title: ${title.substring(0, 30)}..., Image: ${image ? "Yes" : "No"}, Price: ${price}`);

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
