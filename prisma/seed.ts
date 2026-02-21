import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // ─── Admin user ───
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "changeme123", 12);
    const admin = await prisma.user.upsert({
        where: { email: process.env.ADMIN_EMAIL || "admin@hirehub.com" },
        update: {},
        create: {
            email: process.env.ADMIN_EMAIL || "admin@hirehub.com",
            name: "Admin",
            hashedPassword,
            role: "ADMIN",
        },
    });
    console.log(`✅ Admin user: ${admin.email}`);

    // ─── Equipment Items ───
    // Lighting
    const titanTube = await prisma.equipmentItem.upsert({
        where: { slug: "astera-titan-tube" },
        update: { dayRate: 25, ownedQuantity: 8, subhireAvailable: true, subhireMax: 16, preferredSupplier: "PRG / LX", subhireCostPerDay: 15, markupPercent: 67, leadTimeDays: 2 },
        create: {
            name: "Astera Titan Tube", slug: "astera-titan-tube",
            description: "Industry-leading wireless RGBMA LED tube with exceptional colour rendering (CRI 96+). Fully battery-powered, IP65 waterproof, with AsteraApp wireless control.",
            category: "Lighting", brand: "Astera", dayRate: 25,
            quantityTotal: 99, // soft inventory: always available
            tags: ["Wireless", "IP65", "CRI 96+", "RGBMA"],
            featured: true, sortOrder: 1,
            ownedQuantity: 8, subhireAvailable: true, subhireMax: 16,
            preferredSupplier: "PRG / LX", subhireCostPerDay: 15, markupPercent: 67, leadTimeDays: 2,
            images: [encodeURI("/images/Titan tube.png")],
        },
    });

    const ax1Tube = await prisma.equipmentItem.upsert({
        where: { slug: "astera-ax1-tube" },
        update: { dayRate: 20, ownedQuantity: 8, subhireAvailable: true, subhireMax: 16, preferredSupplier: "PRG / LX", subhireCostPerDay: 12, markupPercent: 67, leadTimeDays: 2 },
        create: {
            name: "Astera AX1 Tube", slug: "astera-ax1-tube",
            description: "Compact wireless pixel tube with individual LED control. Perfect for uplighting, accents, and creative installations. Battery-powered with wireless DMX.",
            category: "Lighting", brand: "Astera", dayRate: 20,
            quantityTotal: 99,
            tags: ["Wireless", "Pixel Control", "Battery"],
            featured: true, sortOrder: 2,
            ownedQuantity: 8, subhireAvailable: true, subhireMax: 16,
            preferredSupplier: "PRG / LX", subhireCostPerDay: 12, markupPercent: 67, leadTimeDays: 2,
            images: [encodeURI("/images/AX1.webp")],
        },
    });

    const art7 = await prisma.equipmentItem.upsert({
        where: { slug: "astera-art7-transceiver" },
        update: { dayRate: 20, ownedQuantity: 2, subhireAvailable: true, subhireMax: 4, preferredSupplier: "PRG / LX", subhireCostPerDay: 12, markupPercent: 67, leadTimeDays: 2 },
        create: {
            name: "Astera ART7 Transceiver", slug: "astera-art7-transceiver",
            description: "Wireless CRMX transceiver for controlling Astera fixtures. Pairs with iPad via AsteraApp for full show control.",
            category: "Lighting", brand: "Astera", dayRate: 20,
            quantityTotal: 99,
            tags: ["CRMX", "Wireless Control", "AsteraApp"],
            sortOrder: 3,
            ownedQuantity: 2, subhireAvailable: true, subhireMax: 4,
            preferredSupplier: "PRG / LX", subhireCostPerDay: 12, markupPercent: 67, leadTimeDays: 2,
            images: [encodeURI("/images/art7.png")],
        },
    });

    const superClamp = await prisma.equipmentItem.upsert({
        where: { slug: "manfrotto-035-super-clamp" },
        update: { dayRate: 2, ownedQuantity: 8 },
        create: {
            name: "Manfrotto 035 Super Clamp", slug: "manfrotto-035-super-clamp",
            description: "Versatile mounting clamp for attaching lighting fixtures to truss, pipes, and stands. Universal jaw fits 13–55mm tubes.",
            category: "Lighting", brand: "Manfrotto", dayRate: 2,
            quantityTotal: 99,
            tags: ["Clamp", "Mounting", "Universal"],
            sortOrder: 4,
            ownedQuantity: 8, subhireAvailable: false,
            images: [encodeURI("/images/manfrotto 035 superclamp.jpg")],
        },
    });

    // DJ & Playback
    const technics = await prisma.equipmentItem.upsert({
        where: { slug: "technics-1210-mk2" },
        update: { dayRate: 35, ownedQuantity: 2 },
        create: {
            name: "Technics 1210 MK2", slug: "technics-1210-mk2",
            description: "The legendary direct-drive turntable. Industry standard for vinyl DJs worldwide. Quartz-locked pitch control with ±8% range.",
            category: "DJ & Playback", brand: "Technics", dayRate: 35,
            quantityTotal: 99,
            tags: ["Vinyl", "Direct Drive", "Quartz Lock"],
            featured: true, sortOrder: 10,
            ownedQuantity: 2, subhireAvailable: false,
            images: [encodeURI("/images/Technics 1210.png")],
        },
    });

    const xone92 = await prisma.equipmentItem.upsert({
        where: { slug: "allen-heath-xone-92" },
        update: { dayRate: 35, ownedQuantity: 1 },
        create: {
            name: "Allen & Heath Xone:92", slug: "allen-heath-xone-92",
            description: "Professional 4-channel analogue DJ mixer with VCF filters and external effects loop. Warm, rich sound preferred by underground DJs.",
            category: "DJ & Playback", brand: "Allen & Heath", dayRate: 35,
            quantityTotal: 99,
            tags: ["Analogue", "VCF Filters", "4-Channel"],
            sortOrder: 11,
            ownedQuantity: 1, subhireAvailable: false,
            images: [encodeURI("/images/xone 92.png")],
        },
    });

    await prisma.equipmentItem.upsert({
        where: { slug: "allen-heath-xone-96" },
        update: { dayRate: 45, ownedQuantity: 0, subhireAvailable: true, subhireMax: 1 },
        create: {
            name: "Allen & Heath Xone:96", slug: "allen-heath-xone-96",
            description: "Flagship 4+2 channel analogue DJ mixer with dual USB soundcards and studio-grade effects. The ultimate mixer for discerning DJs.",
            category: "DJ & Playback", brand: "Allen & Heath", dayRate: 45,
            quantityTotal: 99,
            tags: ["Analogue", "Dual USB", "6-Channel"],
            sortOrder: 12,
            ownedQuantity: 0, subhireAvailable: true, subhireMax: 1,
            preferredSupplier: "Local DJ hire", subhireCostPerDay: 25, markupPercent: 80, leadTimeDays: 1,
            images: [encodeURI("/images/xone 96.jpg")],
        },
    });

    await prisma.equipmentItem.upsert({
        where: { slug: "pioneer-djm-a9" },
        update: { dayRate: 60, ownedQuantity: 0, subhireAvailable: true, subhireMax: 1 },
        create: {
            name: "Pioneer DJM-A9", slug: "pioneer-djm-a9",
            description: "Pioneer's flagship 4-channel professional DJ mixer. Successor to the iconic DJM-900NXS2 with enhanced connectivity and legendary sound quality.",
            category: "DJ & Playback", brand: "Pioneer", dayRate: 60,
            quantityTotal: 99,
            tags: ["4-Channel", "Pro-Link", "Beat FX"],
            sortOrder: 13,
            ownedQuantity: 0, subhireAvailable: true, subhireMax: 1,
            preferredSupplier: "Local DJ hire", subhireCostPerDay: 35, markupPercent: 71, leadTimeDays: 1,
            images: [encodeURI("/images/DJM A9.png")],
        },
    });

    const xdjaz = await prisma.equipmentItem.upsert({
        where: { slug: "alphatheta-xdj-az" },
        update: { dayRate: 130, ownedQuantity: 1 },
        create: {
            name: "AlphaTheta XDJ-AZ", slug: "alphatheta-xdj-az",
            description: "Professional all-in-one DJ system with 2 decks, 4-channel mixer, and 7\" touchscreen. rekordbox and Serato compatible.",
            category: "DJ & Playback", brand: "AlphaTheta", dayRate: 130,
            quantityTotal: 99,
            tags: ["All-in-One", "Touchscreen", "rekordbox"],
            featured: true, sortOrder: 14,
            ownedQuantity: 1, subhireAvailable: false,
            images: [encodeURI("/images/xdj az.webp")],
        },
    });

    await prisma.equipmentItem.upsert({
        where: { slug: "pioneer-ddj-1000" },
        update: { dayRate: 20, ownedQuantity: 1 },
        create: {
            name: "Pioneer DDJ-1000", slug: "pioneer-ddj-1000",
            description: "4-channel professional performance DJ controller for rekordbox. Club-style layout with full-size jog wheels.",
            category: "DJ & Playback", brand: "Pioneer", dayRate: 20,
            quantityTotal: 99,
            tags: ["Controller", "rekordbox", "4-Channel"],
            sortOrder: 15,
            ownedQuantity: 1, subhireAvailable: false,
            images: [encodeURI("/images/ddj 1000.png")],
        },
    });

    await prisma.equipmentItem.upsert({
        where: { slug: "pioneer-xdj-700" },
        update: { dayRate: 10, ownedQuantity: 2 },
        create: {
            name: "Pioneer XDJ-700", slug: "pioneer-xdj-700",
            description: "Compact digital deck with touchscreen and rekordbox integration. Perfect for mobile setups and secondary stages.",
            category: "DJ & Playback", brand: "Pioneer", dayRate: 10,
            quantityTotal: 99,
            tags: ["Compact", "rekordbox", "Touchscreen"],
            sortOrder: 16,
            ownedQuantity: 2, subhireAvailable: false,
            images: [encodeURI("/images/xdj 700.jpg")],
        },
    });

    const cdj3000 = await prisma.equipmentItem.upsert({
        where: { slug: "pioneer-cdj-3000" },
        update: { dayRate: 70, ownedQuantity: 0, subhireAvailable: true, subhireMax: 3 },
        create: {
            name: "Pioneer CDJ-3000", slug: "pioneer-cdj-3000",
            description: "The global industry standard for professional DJ performances. 9\" HD touchscreen, new MPU and high-quality audio processing.",
            category: "DJ & Playback", brand: "Pioneer", dayRate: 70,
            quantityTotal: 99,
            tags: ["Industry Standard", "HD Touchscreen", "Pro-Link"],
            featured: true, sortOrder: 17,
            ownedQuantity: 0, subhireAvailable: true, subhireMax: 3,
            preferredSupplier: "Local DJ hire", subhireCostPerDay: 40, markupPercent: 75, leadTimeDays: 1,
            images: [encodeURI("/images/cdj 3000.png")],
        },
    });

    console.log("✅ Created equipment items");

    // ─── Packages ───

    // 1. Titan Tube Package
    const titanPkg = await prisma.package.upsert({
        where: { slug: "titan-tube-package" },
        update: {
            dayRate: 195, savingsNote: "Separately would be £240 — save £45", includes: [
                "8x Astera Titan Tubes in charging flight case",
                "16x Tube Clamp", "16x Eye Bolt", "8x Floor Stand", "8x Wing Plate",
                "16x Safety Pin", "8x Charger", "8x 13A Mains Cable",
                "1x ART7 Transceiver with iPad", "8x Super Clamp"
            ]
        },
        create: {
            name: "Titan Tube Package", slug: "titan-tube-package",
            description: "Complete Astera Titan Tube production kit. 8 wireless RGBMA tubes in a charging flight case with all accessories, ART7 wireless control with iPad, and mounting clamps.",
            dayRate: 195,
            includes: [
                "8x Astera Titan Tubes in charging flight case",
                "16x Tube Clamp", "16x Eye Bolt", "8x Floor Stand", "8x Wing Plate",
                "16x Safety Pin", "8x Charger", "8x 13A Mains Cable",
                "1x ART7 Transceiver with iPad", "8x Super Clamp"
            ],
            savingsNote: "Separately would be £240 — save £45",
            featured: true, sortOrder: 1, images: [],
        },
    });

    // 2. AX1 Tube Package
    const ax1Pkg = await prisma.package.upsert({
        where: { slug: "ax1-tube-package" },
        update: {
            dayRate: 150, savingsNote: "Separately would be £195 — save £45", includes: [
                "8x Astera AX1 Tubes in charging flight case",
                "16x Tube Clamp", "16x Eye Bolt", "8x Floor Stand",
                "16x Safety Pin", "8x Charger", "8x 13A Mains Cable",
                "1x ART7 Transceiver with iPad", "8x Super Clamp"
            ]
        },
        create: {
            name: "AX1 Tube Package", slug: "ax1-tube-package",
            description: "Complete Astera AX1 pixel tube kit. 8 compact wireless tubes in a charging flight case with accessories, ART7 control with iPad, and mounting clamps.",
            dayRate: 150,
            includes: [
                "8x Astera AX1 Tubes in charging flight case",
                "16x Tube Clamp", "16x Eye Bolt", "8x Floor Stand",
                "16x Safety Pin", "8x Charger", "8x 13A Mains Cable",
                "1x ART7 Transceiver with iPad", "8x Super Clamp"
            ],
            savingsNote: "Separately would be £195 — save £45",
            featured: true, sortOrder: 2, images: [],
        },
    });

    // 3. Party / Mobile DJ Package
    await prisma.package.upsert({
        where: { slug: "party-mobile-dj-package" },
        update: {
            dayRate: 200, savingsNote: "Separately would be £240 — save £40", optionalAddons: ["Optional DJ — £60/hour"], includes: [
                "AlphaTheta XDJ-AZ", "4x Astera AX1 Tubes",
                "1x ART7 Transceiver", "4x Super Clamps"
            ]
        },
        create: {
            name: "Party / Mobile DJ Package", slug: "party-mobile-dj-package",
            description: "Everything you need for a party. Professional all-in-one DJ system with wireless lighting to transform any space.",
            dayRate: 200,
            includes: [
                "AlphaTheta XDJ-AZ", "4x Astera AX1 Tubes",
                "1x ART7 Transceiver", "4x Super Clamps"
            ],
            savingsNote: "Separately would be £240 — save £40",
            optionalAddons: ["Optional DJ — £60/hour"],
            featured: true, sortOrder: 3, images: [],
        },
    });

    // 4. Wedding / Premium Event Package
    await prisma.package.upsert({
        where: { slug: "wedding-premium-event-package" },
        update: {
            savingsNote: "Complete premium event solution", optionalAddons: ["Optional 8x AX1 Tubes", "Optional DJ — £60/hour"], includes: [
                "XDJ-AZ or Technics 1210s with Xone:92",
                "8x Astera Titan Tubes", "1x ART7 Transceiver", "Full clamp set"
            ]
        },
        create: {
            name: "Wedding / Premium Event Package", slug: "wedding-premium-event-package",
            description: "The ultimate premium event package. Choose between the XDJ-AZ all-in-one system or classic Technics 1210s with the renowned Xone:92 mixer, paired with stunning Astera Titan Tube lighting.",
            dayRate: null,
            contactForPrice: true,
            includes: [
                "XDJ-AZ or Technics 1210s with Xone:92",
                "8x Astera Titan Tubes", "1x ART7 Transceiver", "Full clamp set"
            ],
            savingsNote: "Complete premium event solution",
            optionalAddons: ["Optional 8x AX1 Tubes", "Optional DJ — £60/hour"],
            featured: true, sortOrder: 4, images: [],
        },
    });

    // 5. Club / Rider-Friendly DJ Package
    await prisma.package.upsert({
        where: { slug: "club-rider-friendly-dj-package" },
        update: {
            dayRate: 200, savingsNote: "From just £200/day", optionalAddons: ["Optional lighting add-ons"], includes: [
                "2x Pioneer CDJ-3000", "DJM-A9 or Xone:92/96"
            ]
        },
        create: {
            name: "Club / Rider-Friendly DJ Package", slug: "club-rider-friendly-dj-package",
            description: "Industry-standard club setup that meets any DJ rider. CDJ-3000 decks with your choice of flagship mixer.",
            dayRate: 200,
            includes: [
                "2x Pioneer CDJ-3000", "DJM-A9 or Xone:92/96"
            ],
            savingsNote: "From just £200/day",
            optionalAddons: ["Optional lighting add-ons"],
            featured: true, sortOrder: 5, images: [],
        },
    });

    // 6. Vinyl DJ Package
    await prisma.package.upsert({
        where: { slug: "vinyl-dj-package" },
        update: {
            dayRate: 150, savingsNote: "From just £150/day", optionalAddons: ["Optional Astera AX1 or Titan Tubes"], includes: [
                "2x Technics 1210 MK2", "Allen & Heath Xone:92"
            ]
        },
        create: {
            name: "Vinyl DJ Package", slug: "vinyl-dj-package",
            description: "Classic vinyl setup for purists. The legendary Technics 1210 MK2 turntables paired with the warm analogue sound of the Allen & Heath Xone:92.",
            dayRate: 150,
            includes: [
                "2x Technics 1210 MK2", "Allen & Heath Xone:92"
            ],
            savingsNote: "From just £150/day",
            optionalAddons: ["Optional Astera AX1 or Titan Tubes"],
            featured: true, sortOrder: 6, images: [],
        },
    });

    console.log("✅ Created packages");

    // ─── Link package items ───
    // Titan Tube Package
    for (const { item, qty } of [
        { item: titanTube, qty: 8 }, { item: art7, qty: 1 }, { item: superClamp, qty: 8 },
    ]) {
        await prisma.packageItem.upsert({
            where: { packageId_equipmentItemId: { packageId: titanPkg.id, equipmentItemId: item.id } },
            update: { quantity: qty },
            create: { packageId: titanPkg.id, equipmentItemId: item.id, quantity: qty },
        });
    }
    // AX1 Tube Package
    for (const { item, qty } of [
        { item: ax1Tube, qty: 8 }, { item: art7, qty: 1 }, { item: superClamp, qty: 8 },
    ]) {
        await prisma.packageItem.upsert({
            where: { packageId_equipmentItemId: { packageId: ax1Pkg.id, equipmentItemId: item.id } },
            update: { quantity: qty },
            create: { packageId: ax1Pkg.id, equipmentItemId: item.id, quantity: qty },
        });
    }

    console.log("✅ Linked package items");

    // ─── Service add-ons ───
    await Promise.all([
        prisma.serviceAddon.upsert({
            where: { id: "svc-delivery" },
            update: {},
            create: { id: "svc-delivery", name: "Delivery & Collection", description: "White-glove delivery to any venue in Greater Manchester. Includes setup assistance.", pricingType: "FIXED", priceValue: 150 },
        }),
        prisma.serviceAddon.upsert({
            where: { id: "svc-technician" },
            update: { description: "Personal lead technician to oversee your event from startup to de-rig." },
            create: { id: "svc-technician", name: "On-Site Technician", description: "Personal lead technician to oversee your event from startup to de-rig.", pricingType: "PER_DAY", priceValue: 350 },
        }),
        prisma.serviceAddon.upsert({
            where: { id: "svc-dj" },
            update: { description: "Carefully curated DJ services from our boutique roster, tailored to your event's atmosphere." },
            create: { id: "svc-dj", name: "Boutique DJ Services", description: "Carefully curated DJ services from our boutique roster, tailored to your event's atmosphere.", pricingType: "FIXED", priceValue: 60 },
        }),
        prisma.serviceAddon.upsert({
            where: { id: "svc-planning" },
            update: { name: "Boutique Party Planning", description: "Coordination of technical schedules, atmospheric design, and supplier management." },
            create: { id: "svc-planning", name: "Boutique Party Planning", description: "Coordination of technical schedules, atmospheric design, and supplier management.", pricingType: "FIXED", priceValue: 250 },
        }),
        prisma.serviceAddon.upsert({
            where: { id: "svc-sax" },
            update: { description: "Live saxophonist performance to accompany your DJ or backing tracks." },
            create: { id: "svc-sax", name: "Live Saxophonist", description: "Live saxophonist performance to accompany your DJ or backing tracks.", pricingType: "FIXED", priceValue: 300 },
        }),
        prisma.serviceAddon.upsert({
            where: { id: "svc-magician" },
            update: { description: "Professional close-up magician for drinks receptions and table entertainment." },
            create: { id: "svc-magician", name: "Close-up Magician", description: "Professional close-up magician for drinks receptions and table entertainment.", pricingType: "FIXED", priceValue: 350 },
        }),
        prisma.serviceAddon.upsert({
            where: { id: "svc-insurance" },
            update: { isActive: false },
            create: { id: "svc-insurance", name: "Damage Waiver", description: "Reduces your liability for accidental damage during the hire period.", pricingType: "PERCENT_OF_SUBTOTAL", priceValue: 10, isActive: false },
        }),
    ]);
    console.log("✅ Created service add-ons");

    // ─── Testimonials ───
    await Promise.all([
        prisma.testimonial.upsert({
            where: { id: "t-james" },
            update: {},
            create: {
                id: "t-james",
                name: "James Harrington",
                role: "Event Director",
                company: "Manchester Town Hall",
                eventType: "Corporate Gala",
                quote: "Blanc. handled the technical production for our annual gala flawlessly. The lighting design transformed the Great Hall into something truly world-class.",
                rating: 5,
                featured: true,
                sortOrder: 1
            },
        }),
        prisma.testimonial.upsert({
            where: { id: "t-sophie" },
            update: {},
            create: {
                id: "t-sophie",
                name: "Sophie Edwards",
                role: "Head of Marketing",
                company: "Victoria Warehouse",
                eventType: "Product Launch",
                quote: "The wireless Astera setup was game-changing for our launch event. Clean, fast setup and stunning results. Highly recommend the Blanc. team.",
                rating: 5,
                featured: true,
                sortOrder: 2
            },
        }),
        prisma.testimonial.upsert({
            where: { id: "t-mark" },
            update: {},
            create: {
                id: "t-mark",
                name: "Mark Sanderson",
                role: "Wedding Client",
                eventType: "Wedding",
                quote: "From the initial quote to the event night, the service was impeccable. The sound quality and atmosphere for our wedding were exactly what we dreamed of.",
                rating: 5,
                featured: false,
                sortOrder: 3
            },
        }),
        prisma.testimonial.upsert({
            where: { id: "t-laura" },
            update: {},
            create: {
                id: "t-laura",
                name: "Laura Bennett",
                role: "Planning Lead",
                company: "Northern Events Co.",
                eventType: "Fashion Show",
                quote: "Extremely professional inventory. The equipment arrived in perfect condition, and the technical support provided was second to none.",
                rating: 5,
                featured: true,
                sortOrder: 4
            },
        }),
    ]);
    console.log("✅ Created testimonials");

    console.log("\n🎉 Seed complete!");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
