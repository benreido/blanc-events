const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const imageMap = {
    "astera-ax1-tube": "/images/AX1.webp",
    "pioneer-djm-a9": "/images/DJM A9.png",
    "technics-1210-mk2": "/images/Technics 1210.png",
    "astera-titan-tube": "/images/Titan tube.png",
    "astera-art7-transceiver": "/images/art7.png",
    "pioneer-cdj-3000": "/images/cdj 3000.png",
    "pioneer-ddj-1000": "/images/ddj 1000.png",
    "manfrotto-035-super-clamp": "/images/manfrotto 035 superclamp.jpg",
    "pioneer-xdj-700": "/images/xdj 700.jpg",
    "alphatheta-xdj-az": "/images/xdj az.webp",
    "allen-heath-xone-92": "/images/xone 92.png",
    "allen-heath-xone-96": "/images/xone 96.jpg",
};

async function main() {
    console.log("Updating equipment images...");
    for (const [slug, fileName] of Object.entries(imageMap)) {
        await prisma.equipmentItem.update({
            where: { slug },
            data: { images: [encodeURI(fileName)] },
        }).catch(err => console.log(`Skipped ${slug}:`, err.message));
        console.log(`Updated ${slug} -> ${fileName}`);
    }
    console.log("Done linking equipment images.");

    // We can also add images to packages if we want.
    // E.g. Vinyl Package -> use technics & xone images
    await prisma.package.update({
        where: { slug: "vinyl-dj-package" },
        data: { images: [encodeURI("/images/Technics 1210.png"), encodeURI("/images/xone 92.png")] }
    }).catch(() => { });

    await prisma.package.update({
        where: { slug: "club-rider-friendly-dj-package" },
        data: { images: [encodeURI("/images/cdj 3000.png"), encodeURI("/images/DJM A9.png")] }
    }).catch(() => { });

    await prisma.package.update({
        where: { slug: "wedding-premium-event-package" },
        data: { images: [encodeURI("/images/xdj az.webp"), encodeURI("/images/Titan tube.png")] }
    }).catch(() => { });

    await prisma.package.update({
        where: { slug: "party-mobile-dj-package" },
        data: { images: [encodeURI("/images/xdj az.webp"), encodeURI("/images/AX1.webp")] }
    }).catch(() => { });

    await prisma.package.update({
        where: { slug: "ax1-tube-package" },
        data: { images: [encodeURI("/images/AX1.webp")] }
    }).catch(() => { });

    await prisma.package.update({
        where: { slug: "titan-tube-package" },
        data: { images: [encodeURI("/images/Titan tube.png")] }
    }).catch(() => { });

    console.log("Done linking package images.");
}

main().finally(() => prisma.$disconnect());
