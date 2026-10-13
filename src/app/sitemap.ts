import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://www.blanc-events.co.uk";

// Re-generate hourly so newly added catalogue items appear without a deploy.
export const revalidate = 3600;

const STATIC_ROUTES: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/services`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/weddings`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/corporate`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/hire`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/packages`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/book`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();
    const staticRoutes = STATIC_ROUTES.map((r) => ({ ...r, lastModified: now }));

    try {
        const [equipment, packages] = await Promise.all([
            prisma.equipmentItem.findMany({
                where: { isActive: true },
                select: { slug: true, updatedAt: true },
            }),
            prisma.package.findMany({
                where: { isActive: true },
                select: { slug: true, updatedAt: true },
            }),
        ]);

        const equipmentRoutes: MetadataRoute.Sitemap = equipment.map((item) => ({
            url: `${BASE_URL}/hire/${item.slug}`,
            lastModified: item.updatedAt ?? now,
            changeFrequency: "weekly",
            priority: 0.8,
        }));

        const packageRoutes: MetadataRoute.Sitemap = packages.map((pkg) => ({
            url: `${BASE_URL}/packages/${pkg.slug}`,
            lastModified: pkg.updatedAt ?? now,
            changeFrequency: "weekly",
            priority: 0.8,
        }));

        return [...staticRoutes, ...equipmentRoutes, ...packageRoutes];
    } catch {
        // If the database is unreachable at build time, still emit a valid
        // sitemap rather than failing the build.
        return staticRoutes;
    }
}
