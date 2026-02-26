import { prisma } from "@/lib/prisma";

type ItemRef = {
    equipmentItemId: string | null;
    packageId: string | null;
    quantity: number;
    dayRate: number;
    lineTotal: number;
    type?: "eq" | "pkg";
    eqId?: string | null;
    pkgId?: string | null;
    pkgItems?: { equipmentItemId: string; quantity: number }[];
};
export async function calculateOrderMargin(
    lineItems: { equipmentItemId: string | null; packageId: string | null; quantity: number; dayRate: number; lineTotal: number }[],
    numberOfDays: number,
    orderTotal: number,
    servicesTotal: number
) {
    let subhireTotalCost = 0;
    let ownedEquipmentValue = 0;
    let subhireRequired = false;
    let subhireAlertStr = "";

    // Aggregate equipment
    const equipmentTally: Record<string, number> = {};
    const itemRefs: ItemRef[] = []; // to store back-references

    for (const li of lineItems) {
        if (li.equipmentItemId) {
            equipmentTally[li.equipmentItemId] = (equipmentTally[li.equipmentItemId] || 0) + li.quantity;
            itemRefs.push({ ...li, type: "eq", eqId: li.equipmentItemId });
        } else if (li.packageId) {
            const pkgItems = await prisma.packageItem.findMany({ where: { packageId: li.packageId } });
            for (const pi of pkgItems) {
                equipmentTally[pi.equipmentItemId] = (equipmentTally[pi.equipmentItemId] || 0) + (pi.quantity * li.quantity);
            }
            itemRefs.push({ ...li, type: "pkg", pkgId: li.packageId, pkgItems });
        }
    }

    const eqIds = Object.keys(equipmentTally);
    const equipmentData = await prisma.equipmentItem.findMany({ where: { id: { in: eqIds } } });
    const eqMap = new Map(equipmentData.map(e => [e.id, e]));

    const alerts: string[] = [];

    // Calculate at the order-wide level so we allocate owned stock globally
    // We'll mutate equipmentTally to represent "remaining owned stock"
    const remainingOwned: Record<string, number> = {};
    for (const eq of equipmentData) {
        remainingOwned[eq.id] = eq.ownedQuantity;
    }

    const processedLineItems = itemRefs.map(li => {
        let liOwnedQtyUsed = 0;
        let liSubhireQtyNeeded = 0;
        let liSubhireCostPerDay = 0;
        let liSubhireCostTotal = 0;
        let liOwnedValueTotal = 0;

        if (li.type === "eq") {
            const eq = eqMap.get(li.eqId || "");
            if (eq) {
                const needed = li.quantity;
                const ownedAvailable = Math.min(needed, Math.max(0, remainingOwned[eq.id] || 0));
                const subhireNeeded = needed - ownedAvailable;

                remainingOwned[eq.id] = (remainingOwned[eq.id] || 0) - ownedAvailable;

                liOwnedQtyUsed = ownedAvailable;
                liSubhireQtyNeeded = subhireNeeded;
                liSubhireCostPerDay = eq.subhireCostPerDay;
                liSubhireCostTotal = subhireNeeded * eq.subhireCostPerDay * numberOfDays;
                liOwnedValueTotal = ownedAvailable * (eq.dayRate || 0) * numberOfDays;

                if (subhireNeeded > 0) {
                    subhireRequired = true;
                    alerts.push(`${subhireNeeded}x ${eq.name}`);
                }
            }
        } else if (li.type === "pkg") {
            // For packages, aggregate the subhire needed for all components
            for (const pi of li.pkgItems || []) {
                const eq = eqMap.get(pi.equipmentItemId);
                if (eq) {
                    const needed = pi.quantity * li.quantity;
                    const ownedAvailable = Math.min(needed, Math.max(0, remainingOwned[eq.id] || 0));
                    const subhireNeeded = needed - ownedAvailable;

                    remainingOwned[eq.id] = (remainingOwned[eq.id] || 0) - ownedAvailable;

                    liOwnedQtyUsed += ownedAvailable; // aggregate
                    liSubhireQtyNeeded += subhireNeeded;
                    liSubhireCostPerDay += (eq.subhireCostPerDay * pi.quantity); // cost per package
                    liSubhireCostTotal += subhireNeeded * eq.subhireCostPerDay * numberOfDays;
                    liOwnedValueTotal += ownedAvailable * (eq.dayRate || 0) * numberOfDays;

                    if (subhireNeeded > 0) {
                        subhireRequired = true;
                        alerts.push(`${subhireNeeded}x ${eq.name}`);
                    }
                }
            }
        }

        subhireTotalCost += liSubhireCostTotal;
        ownedEquipmentValue += liOwnedValueTotal;

        return {
            ...li,
            ownedQtyUsed: liOwnedQtyUsed,
            subhireQtyNeeded: liSubhireQtyNeeded,
            subhireCostPerDay: liSubhireCostPerDay,
            subhireTotalCost: liSubhireCostTotal
        };
    });

    if (alerts.length > 0) {
        subhireAlertStr = `Subhire Required: ${alerts.join(", ")}`;
    }

    // Gross margin = Total Revenue - Direct Costs (Subhire)
    const revenue = orderTotal;
    const grossMarginNum = revenue > 0 ? ((revenue - subhireTotalCost) / revenue) * 100 : 0;

    // Net margin subtracts servicesTotal as an operation cost (dj/addons)
    const netMarginNum = revenue > 0 ? ((revenue - subhireTotalCost - servicesTotal) / revenue) * 100 : 0;

    return {
        processedLineItems,
        subhireTotalCost,
        ownedEquipmentValue,
        grossMargin: grossMarginNum,
        netMargin: netMarginNum,
        subhireRequired,
        subhireAlert: subhireAlertStr,
    };
}
