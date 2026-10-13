import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/config";

const BASE_URL = "https://www.blanc-events.co.uk";

export const revalidate = 3600;

async function getItem(slug: string) {
    return prisma.equipmentItem.findFirst({
        where: { slug, isActive: true },
    });
}

export async function generateStaticParams() {
    // A build-time DB outage must not fail the whole deploy. Returning [] skips
    // prerendering; pages still render on first request and then ISR-cache.
    try {
        const items = await prisma.equipmentItem.findMany({
            where: { isActive: true },
            select: { slug: true },
        });
        return items.map((i) => ({ slug: i.slug }));
    } catch {
        return [];
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const item = await getItem(slug);
    if (!item) return { title: "Equipment not found" };

    const priceLine = item.contactForPrice
        ? "Contact us for a day rate."
        : `From ${formatCurrency(item.dayRate || 0)} per day.`;
    const description = item.description
        ? `${item.description.slice(0, 150)}`.trim()
        : `Hire the ${item.brand} ${item.name} in Manchester from Blanc. Events. ${priceLine} Dry hire and full production across Greater Manchester and the North West.`;

    return {
        // No "| Blanc. Events" suffix here — the root layout template appends it.
        title: `${item.name} Hire Manchester`,
        description,
        alternates: { canonical: `${BASE_URL}/hire/${item.slug}` },
        openGraph: {
            title: `${item.name} Hire Manchester | Blanc. Events`,
            description,
            url: `${BASE_URL}/hire/${item.slug}`,
            images: item.images?.length ? [{ url: item.images[0] }] : undefined,
        },
    };
}

export default async function EquipmentDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const item = await getItem(slug);
    if (!item) notFound();

    const related = await prisma.equipmentItem.findMany({
        where: { isActive: true, category: item.category, NOT: { id: item.id } },
        orderBy: { sortOrder: "asc" },
        take: 3,
    });

    const url = `${BASE_URL}/hire/${item.slug}`;
    const image = item.images?.[0] ? `${BASE_URL}${item.images[0]}` : `${BASE_URL}/og-image.jpg`;

    const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: item.name,
        description:
            item.description ||
            `${item.brand} ${item.name} available for hire in Manchester from Blanc. Events.`,
        sku: item.slug,
        category: item.category,
        image,
        brand: { "@type": "Brand", name: item.brand },
        offers: {
            "@type": "Offer",
            url,
            priceCurrency: "GBP",
            ...(item.contactForPrice
                ? {}
                : { price: String(item.dayRate ?? 0), unitText: "per day" }),
            availability: "https://schema.org/InStock",
            businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
            seller: {
                "@type": "LocalBusiness",
                name: "Blanc. Events",
                telephone: "+447584192578",
                address: {
                    "@type": "PostalAddress",
                    streetAddress: "19 Cheetham Hill Road",
                    addressLocality: "Manchester",
                    postalCode: "M4 4FY",
                    addressCountry: "GB",
                },
            },
        },
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
            { "@type": "ListItem", position: 2, name: "Hire", item: `${BASE_URL}/hire` },
            { "@type": "ListItem", position: 3, name: item.name, item: url },
        ],
    };

    const specs = (item.specs as Record<string, string> | null) || null;

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
                <nav aria-label="Breadcrumb" className="mb-8 text-sm text-slate-500">
                    <ol className="flex flex-wrap items-center gap-2">
                        <li>
                            <Link href="/" className="hover:text-[#1F5C4B]">
                                Home
                            </Link>
                        </li>
                        <li aria-hidden="true">/</li>
                        <li>
                            <Link href="/hire" className="hover:text-[#1F5C4B]">
                                Hire
                            </Link>
                        </li>
                        <li aria-hidden="true">/</li>
                        <li className="text-slate-900 font-medium">{item.name}</li>
                    </ol>
                </nav>

                <div className="grid md:grid-cols-2 gap-10">
                    <div className="relative aspect-square bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                        {item.images?.[0] ? (
                            <Image
                                src={item.images[0]}
                                alt={`${item.brand} ${item.name} available for hire in Manchester`}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-contain p-6"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                                Photography coming soon
                            </div>
                        )}
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#1F5C4B]">
                            {item.brand} · {item.category}
                        </p>
                        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900">
                            {item.name} Hire in Manchester
                        </h1>

                        <div className="mt-5 flex items-baseline gap-2">
                            {item.contactForPrice ? (
                                <span className="text-2xl font-bold text-slate-900">
                                    Contact for price
                                </span>
                            ) : (
                                <>
                                    <span className="text-3xl font-bold text-slate-900">
                                        {formatCurrency(item.dayRate || 0)}
                                    </span>
                                    <span className="text-sm text-slate-500 font-medium">per day</span>
                                    {item.weekRate ? (
                                        <span className="ml-3 text-sm text-slate-500">
                                            {formatCurrency(item.weekRate)} per week
                                        </span>
                                    ) : null}
                                </>
                            )}
                        </div>

                        {item.description ? (
                            <p className="mt-6 text-slate-600 leading-relaxed">{item.description}</p>
                        ) : null}

                        <div className="mt-8 flex flex-wrap gap-3">
                            {item.contactForPrice ? (
                                <Link
                                    href="/contact"
                                    className="px-6 py-3 rounded-lg bg-[#1F5C4B] text-white font-semibold hover:bg-[#123A2F] transition-colors"
                                >
                                    Request a quote
                                </Link>
                            ) : (
                                <Link
                                    href="/hire"
                                    className="px-6 py-3 rounded-lg bg-[#1F5C4B] text-white font-semibold hover:bg-[#123A2F] transition-colors"
                                >
                                    Add to your hire basket
                                </Link>
                            )}
                            <a
                                href="tel:+447584192578"
                                className="px-6 py-3 rounded-lg border border-slate-200 font-semibold text-slate-700 hover:border-[#1F5C4B] transition-colors"
                            >
                                Call 07584 192 578
                            </a>
                        </div>

                        {item.tags?.length ? (
                            <div className="mt-8 flex flex-wrap gap-2">
                                {item.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-xs font-medium text-slate-600"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>

                {specs && Object.keys(specs).length > 0 ? (
                    <section className="mt-14">
                        <h2 className="text-xl font-bold text-slate-900">Specifications</h2>
                        <dl className="mt-4 grid sm:grid-cols-2 gap-x-10 gap-y-3">
                            {Object.entries(specs).map(([k, v]) => (
                                <div
                                    key={k}
                                    className="flex justify-between gap-4 border-b border-slate-100 py-2"
                                >
                                    <dt className="text-sm text-slate-500">{k}</dt>
                                    <dd className="text-sm font-medium text-slate-900 text-right">
                                        {String(v)}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </section>
                ) : null}

                <section className="mt-14 rounded-xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-slate-900">
                        Hiring the {item.name} in Manchester
                    </h2>
                    <p className="mt-3 text-slate-600 leading-relaxed">
                        Blanc. Events supplies the {item.brand} {item.name} for dry hire and full
                        production across Manchester, Greater Manchester and the North West. Collection
                        is from our Manchester base at 19 Cheetham Hill Road, M4 4FY, and delivery,
                        installation and technical support are available on request.
                    </p>
                    <p className="mt-3 text-slate-600 leading-relaxed">
                        {item.contactForPrice
                            ? "Day rates for this item are quoted on request — get in touch and we'll come back to you the same day."
                            : `Day rate is ${formatCurrency(item.dayRate || 0)}, with multi-day and weekly rates available for longer bookings.`}{" "}
                        Weekend and same-week availability is common, but we'd always recommend
                        confirming early for Friday and Saturday dates.
                    </p>
                </section>

                {related.length > 0 ? (
                    <section className="mt-14">
                        <h2 className="text-xl font-bold text-slate-900">
                            More {item.category} hire
                        </h2>
                        <div className="mt-5 grid sm:grid-cols-3 gap-5">
                            {related.map((r) => (
                                <Link
                                    key={r.id}
                                    href={`/hire/${r.slug}`}
                                    className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-[#1F5C4B]/50 hover:shadow-xl shadow-sm transition-all"
                                >
                                    <div className="relative aspect-video bg-slate-50">
                                        {r.images?.[0] ? (
                                            <Image
                                                src={r.images[0]}
                                                alt={r.name}
                                                fill
                                                sizes="(max-width: 640px) 100vw, 33vw"
                                                className="object-contain p-4"
                                            />
                                        ) : null}
                                    </div>
                                    <div className="p-4">
                                        <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                                            {r.brand}
                                        </p>
                                        <p className="mt-1 font-semibold text-slate-900 group-hover:text-[#1F5C4B] transition-colors">
                                            {r.name}
                                        </p>
                                        <p className="mt-2 text-sm text-slate-500">
                                            {r.contactForPrice
                                                ? "Contact for price"
                                                : `${formatCurrency(r.dayRate || 0)}/day`}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                ) : null}
            </main>

            <Footer />
        </>
    );
}
