import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        // Determine if it's a Meesho URL
        const isMeesho = url.includes("meesho.com");

        // Fetch the page
        // For Meesho, we use a social bot User-Agent to get the Open Graph tags and bypass strict WAF
        const userAgent = isMeesho
            ? "Twitterbot/1.0"
            : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

        console.log(`[Scraper] Fetching URL: ${url} (Is Meesho: ${isMeesho})`);

        const response = await fetch(url, {
            headers: {
                "User-Agent": userAgent,
                "Accept-Language": "en-US,en;q=0.9",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "Referer": isMeesho ? "https://t.co/" : "https://www.google.com/",
            },
        });

        if (!response.ok) {
            console.error(`[Scraper] Fetch failed with status: ${response.status}`);
            return NextResponse.json({ error: `Failed to fetch the URL: ${response.status}` }, { status: 500 });
        }

        const html = await response.text();

        if (html.includes("robot check") || html.includes("captcha") || html.includes("To discuss automated access to Amazon data please contact")) {
            console.error(`[Scraper] Bot detection triggered`);
            return NextResponse.json({ error: "Access denied by platform (Bot Detection)" }, { status: 403 });
        }

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
            description = description.split("Amazon.in")[0].trim();
        } else if (description.includes("Flipkart.com")) {
            description = description.split("Flipkart.com")[0].trim();
        }

        // Clean trailing junk
        description = description.replace(/[:|\-|\s|.]*$/, "").trim();
        title = title.replace(/[:|\-|\s|.]*$/, "").trim();

        let image =
            $('meta[property="og:image"]').attr("content") ||
            $('meta[name="twitter:image"]').attr("content") ||
            "";

        // Try to guess platform
        let platform = "other";
        if (url.includes("amazon")) platform = "amazon";
        else if (url.includes("flipkart")) platform = "flipkart";
        else if (url.includes("meesho")) platform = "meesho";

        // Platform-specific enhancements
        let originalPrice = "";
        let discountedPrice = "";
        let rating = "";
        let reviewsCount = "";
        let category = "";

        if (platform === "amazon") {
            // Discounted Price: prioritize deal price if available
            discountedPrice =
                $(".a-price.priceToPay .a-price-whole").first().text() ||
                $(".a-price-whole").first().text() ||
                $(".a-price .a-offscreen").first().text() ||
                $("#priceblock_ourprice").text() ||
                $("#priceblock_dealprice").text() ||
                $("#kindle-price").text() ||
                $("#price").text();

            // Original Price (M.R.P)
            originalPrice =
                $(".a-price.a-text-price span[aria-hidden='true']").first().text() ||
                $(".basisPrice .a-offscreen").first().text() ||
                $(".a-text-strike").first().text() ||
                $("#listPrice").text();

            // Rating
            const ratingText =
                $("span[data-hook='rating-out-of-text']").first().text() ||
                $("i.a-icon-star span.a-icon-alt").first().text() ||
                $(".a-icon-star span").first().text();

            if (ratingText) {
                const match = ratingText.match(/(\d+\.?\d*)/);
                if (match) rating = match[1];
            }

            // Reviews Count
            reviewsCount = $("#acrCustomerReviewText").first().text().replace(/[^\d]/g, "");

            // Image: Amazon often has multiple images, try to get the main one
            const landingImage = $("#landingImage");
            const dynamicImageAttr = landingImage.attr("data-a-dynamic-image");

            if (dynamicImageAttr) {
                try {
                    const images = JSON.parse(dynamicImageAttr);
                    const urls = Object.keys(images);
                    if (urls.length > 0) {
                        image = urls.reduce((prev, curr) => images[curr][0] > images[prev][0] ? curr : prev);
                    }
                } catch (e) {
                    image = landingImage.attr("src") || image;
                }
            } else {
                image = landingImage.attr("src") || $("#imgBlkFront").attr("src") || $("#main-image").attr("src") || image;
            }

            // Category extraction from breadcrumbs
            const breadcrumb = $("#wayfinding-breadcrumbs_container ul li a").first().text().trim() ||
                $("#wayfinding-breadcrumbs_feature_div ul li a").first().text().trim() ||
                $(".a-breadcrumb li a").first().text().trim();

            if (breadcrumb) category = breadcrumb;

            // CDN fallback for Amazon
            if (!image) {
                image = $('img[src*="media-amazon.com/images/I/"]').first().attr("src") || "";
            }
        } else if (platform === "flipkart") {
            // Price
            discountedPrice = $("._30jeq3._16Jk6d").first().text() || $("._30jeq3").first().text();
            originalPrice = $("._3I9_ca").first().text() || $("._2p6l8y").first().text();

            // Rating
            rating = $("._3LWZlK").first().text();
            reviewsCount = $("._2AfS94").first().text().replace(/[^\d]/g, "");

            // Image: Flipkart specific
            const flipkartImg = $("img._396cs4").attr("src") || $("img._2r_T1I").attr("src") || $('img[alt="product"]').attr("src");
            if (flipkartImg) image = flipkartImg;
        } else if (platform === "meesho") {
            // Meesho Logic (via OpenGraph/Twitter Cards)
            // Example Description: "Get this product for ₹233 ..." or similar variants

            // Attempt to extract price from description or title if possible
            // Meesho OG description often contains the price
            const priceRegex = /₹\s*([\d,]+)/;

            let priceMatch = description.match(priceRegex);
            if (!priceMatch) {
                priceMatch = title.match(priceRegex);
            }

            if (priceMatch) {
                discountedPrice = priceMatch[1];
            }

            // Clean up title if it has Meesho specific suffix
            title = title.split("| Meesho")[0].trim();
        }

        // Clean up prices
        const cleanPrice = (p: string) => p.replace(/[^\d.]/g, "");
        discountedPrice = cleanPrice(discountedPrice);
        originalPrice = cleanPrice(originalPrice);

        // Clean up relative URLs
        if (image && image.startsWith("//")) {
            image = "https:" + image;
        } else if (image && image.startsWith("/")) {
            try {
                const baseUrl = new URL(url);
                image = baseUrl.origin + image;
            } catch (e) { }
        }

        console.log(`[Scraper] Found - Title: ${title.substring(0, 30)}..., Image: ${image ? "Yes" : "No"}, Price: ${discountedPrice}, Original: ${originalPrice}, Rating: ${rating}`);

        return NextResponse.json({
            title: title.trim(),
            description: description.trim(),
            image: image,
            platform,
            category: category || "Electronics", // Default to Electronics if not found
            discountedPrice: discountedPrice || null,
            originalPrice: originalPrice || null,
            rating: rating || null,
            reviewsCount: reviewsCount || null,
            price: discountedPrice || null // Legacy support
        });
    } catch (error) {
        console.error("Scraping error:", error);
        return NextResponse.json({ error: "Failed to parse the page" }, { status: 500 });
    }
}
