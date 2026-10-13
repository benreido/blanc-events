import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/config";

const BASE_URL = "https://www.blanc-events.co.uk";

export const revalidate = 3600;

async function getPackage(slug: string) {
    return prisma.package.findFirst({
        where: { slug, isActive: true },
        include: {
            items: { include: { equipmentItem: true } },
            djServices: { include: { djService: true } },
        },
    });
}

export async function generateStaticParams() {
    // A build-time DB outage must not fail the whole deploy. Returning [] skips
    // prerendering; pages still render on first request and then ISR-cache.
    try {
        const packages = await prisma.package.findMany({
            where: { isActive: true },
            select: { slug: true },
        });
        return packages.map((p) => ({ slug: p.slug }));
    } catch {
        return [];
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const pkg = await getPackage(slug);
    if (!pkg) return { title: "Package not found" };

    const priceLine = pkg.contactForPrice
        ? "Quoted on request."
        : `From ${formatCurrency(pkg.dayRate || 0)} per day.`;
    const description = pkg.description
        ? pkg.description.slice(0, 150).trim()
        : `${pkg.name} equipment package for hire in Manchester from Blanc. Events. ${priceLine}`;

    return {
        // No "| Blanc. Events" suffix — the root layout template appends it.
        title: `${pkg.name} Package Hire Manchester`,
        description,
        alternates: { canonical: `${BASE_URL}/packages/${pkg.slug}` },
        openGraph: {
            title: `${pkg.name} Package Hire Manchester | Blanc. Events`,
            description,
            url: `${BASE_URL}/packages/${pkg.slug}`,
            images: pkg.images?.length ? [{ url: pkg.images[0] }] : undefined,
        },
    };
}

export default async function PackageDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const pkg = await getPackage(slug);
    if (!pkg) notFound();

    const url = `${BASE_URL}/packages/${pkg.slug}`;
    const image = pkg.images?.[0] ? `${BASE_URL}${pkg.images[0]}` : `${BASE_URL}/og-image.jpg`;

    // Quote-only packages must route to /contact — the booking wizard would
    // compute a £0 checkout because it only sums items that carry a dayRate.
    const ctaHref = pkg.contactForPrice ? "/contact" : "/book";
    const ctaLabel = pkg.contactForPrice ? "Request a quote" : "Check availability";

    const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: `${pkg.name} Package`,
        description:
            pkg.description ||
            `${pkg.name} equipment package available for hire in Manchester from Blanc. Events.`,
        sku: pkg.slug,
        image,
        brand: { "@type": "Brand", name: "Blanc. Events" },
        offers: {
            "@type": "Offer",
            url,
            priceCurrency: "GBP",
            ...(pkg.contactForPrice ? {} : { price: String(pkg.dayRate ?? 0), unitText: "per day" }),
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
            { "@type": "ListItem", position: 2, name: "Packages", item: `${BASE_URL}/packages` },
            { "@type": "ListItem", position: 3, name: pkg.name, item: url },
        ],
    };

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
                            <Link href="/packages" className="hover:text-[#1F5C4B]">
                                Packages
                            </Link>
                        </li>
                        <li aria-hidden="true">/</li>
                        <li className="text-slate-900 font-medium">{pkg.name}</li>
                    </ol>
                </nav>

                <div className="grid md:grid-cols-2 gap-10">
                    <div className="relative aspect-square bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                        {pkg.images?.[0] ? (
                            <Image
                                src={pkg.images[0]}
                                alt={`${pkg.name} equipment package for hire in Manchester`}
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
                            Package
                        </p>
                        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900">
                            {pkg.name}
                        </h1>

                        <div className="mt-5 flex items-baseline gap-2">
                            {pkg.contactForPrice ? (
                                <span className="text-2xl font-bold text-slate-900">
                                    Quoted on request
                                </span>
                            ) : (
                                <>
                                    <span className="text-3xl font-bold text-slate-900">
                                        {formatCurrency(pkg.dayRate || 0)}
                                    </span>
                                    <span className="text-sm text-slate-500 font-medium">per day</span>
                                </>
                            )}
                        </div>

                        {pkg.savingsNote ? (
                            <p className="mt-2 text-sm font-medium text-[#1F5C4B]">{pkg.savingsNote}</p>
                        ) : null}

                        {pkg.description ? (
                            <p className="mt-6 text-slate-600 leading-relaxed">{pkg.description}</p>
                        ) : null}

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href={ctaHref}
                                className="px-6 py-3 rounded-lg bg-[#1F5C4B] text-white font-semibold hover:bg-[#123A2F] transition-colors"
                            >
                                {ctaLabel}
                            </Link>
                            <a
                                href="tel:+447584192578"
                                className="px-6 py-3 rounded-lg border border-slate-200 font-semibold text-slate-700 hover:border-[#1F5C4B] transition-colors"
                            >
                                Call 07584 192 578
                            </a>
                        </div>
                    </div>
                </div>

                {pkg.items.length > 0 ? (
                    <section className="mt-14">
                        <h2 className="text-xl font-bold text-slate-900">What&rsquo;s included</h2>
                        <ul className="mt-5 grid sm:grid-cols-2 gap-3">
                            {pkg.items.map((pi) => (
                                <li
                                    key={pi.id}
                                    className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3"
                                >
                                    <Link
                                        href={`/hire/${pi.equipmentItem.slug}`}
                                        className="font-medium text-slate-900 hover:text-[#1F5C4B] transition-colors"
                                    >
                                        {pi.equipmentItem.name}
                                    </Link>
                                    <span className="text-sm text-slate-500 shrink-0">
                                        &times; {pi.quantity}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>
                ) : null}

                {pkg.includes?.length ? (
                    <section className="mt-12">
                        <h2 className="text-xl font-bold text-slate-900">Also included</h2>
                        <ul className="mt-4 space-y-2">
                            {pkg.includes.map((inc) => (
                                <li key={inc} className="flex gap-3 text-slate-600">
                                    <span aria-hidden="true" className="text-[#1F5C4B]">
                                        &#10003;
                                    </span>
                                    <span>{inc}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                ) : null}

                {pkg.optionalAddons?.length ? (
                    <section className="mt-12">
                        <h2 className="text-xl font-bold text-slate-900">Optional add-ons</h2>
                        <ul className="mt-4 flex flex-wrap gap-2">
                            {pkg.optionalAddons.map((a) => (
                                <li
                                    key={a}
                                    className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-sm text-slate-600"
                                >
                                    {a}
                                </li>
                            ))}
                        </ul>
                    </section>
                ) : null}

                <section className="mt-14 rounded-xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-slate-900">
                        Hiring the {pkg.name} package in Manchester
                    </h2>
                    <p className="mt-3 text-slate-600 leading-relaxed">
                        This package is available across Manchester, Greater Manchester and the North
                        West, either as dry hire from our Manchester base at 19 Cheetham Hill Road,
                        M4 4FY, or fully delivered, installed and operated by our team.
                    </p>
                    <p className="mt-3 text-slate-600 leading-relaxed">
                        {pkg.contactForPrice
                            ? "This package is quoted on request so we can match it to your venue and running times — get in touch and we'll come back to you the same day."
                            : "Anything in the package can be swapped or added to. If you need something that isn't listed, just ask."}
                    </p>
                </section>
            </main>

            <Footer />
        </>
    );
}
