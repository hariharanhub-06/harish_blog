import { db } from "@/db";
import { snackProducts, blogPosts } from "@/db/schema";
import { eq } from "drizzle-orm";

const DOMAIN = "https://harishblog.fyi";

export async function GET() {
    // 1. Static Pages
    const staticPages = [
        "",
        "/business",
        "/business/hm-snacks",
        "/business/hm-snacks/cart",
        "/business/hm-tech",
        "/contact",
        "/gallery",
    ];

    // 2. Dynamic Products
    const products = await db.select({ id: snackProducts.id, name: snackProducts.name }).from(snackProducts).where(eq(snackProducts.isActive, true));
    const productPages = products.map((_) => `/business/hm-snacks`); // Currently products don't have individual pages, they're on a list, but we can index the list. If individual pages were to exist, they'd go here.

    // 3. Dynamic Blogs
    const blogs = await db.select({ slug: blogPosts.slug }).from(blogPosts).where(eq(blogPosts.published, true));
    const blogPages = blogs.map((b) => `/blog/${b.slug}`);

    const allPages = [...staticPages, ...blogPages];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${allPages
            .map((page) => {
                return `
        <url>
          <loc>${DOMAIN}${page}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
          <changefreq>daily</changefreq>
          <priority>${page === "" ? "1.0" : "0.8"}</priority>
        </url>
      `;
            })
            .join("")}
    </urlset>`;

    return new Response(sitemap, {
        headers: {
            "Content-Type": "application/xml",
        },
    });
}
