export default function imageKitLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
    if (src.startsWith("/")) return src; // Local images
    if (!src.includes("ik.imagekit.io")) return src; // Not ImageKit images

    const params = [`w-${width}`];
    if (quality) {
        params.push(`q-${quality}`);
    }

    const paramsString = params.join(",");

    // Check if the URL already has parameters
    if (src.includes("?tr=")) {
        return `${src},${paramsString}`;
    }

    // Split at existing query params if any
    const [urlBase, existingQuery] = src.split("?");
    const queryJoin = existingQuery ? `&${existingQuery}` : "";

    return `${urlBase}?tr=${paramsString}${queryJoin}`;
}
