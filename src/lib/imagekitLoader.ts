export default function imageKitLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
    if (src.startsWith("/")) return src; // Local images
    if (!src.includes("ik.imagekit.io")) return src; // Not ImageKit images

    const params = [`w-${width}`];
    if (quality) {
        params.push(`q-${quality}`);
    }

    const paramsString = params.join(",");
    const [urlEnd, ...rest] = src.split("?").reverse();
    const urlBase = rest.reverse().join("?");

    return `${urlBase}?tr=${paramsString}`;
}
