import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "HM Tech Admin",
        short_name: "HM Admin",
        description: "Admin Dashboard for HM Tech and Snacks",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#ec4899",
        icons: [
            {
                src: "/hh-gold-logo.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/hh-gold-logo.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
    };
}
