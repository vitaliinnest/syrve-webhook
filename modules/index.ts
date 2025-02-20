import { IDeliveryItem, IModifier, Syrve, WoocommerceOrder, WoocommerceProduct } from "../types";
import { database } from "../config/database";
import config from "../config";
import stringSimilarity from "string-similarity";

export const to = (promise: Promise<any>) => promise.then((data) => [data, null]).catch((error) => [null, error]);

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const findStreet = (name: string): string => {
    const streets: any = database.get("streets");
    if (streets[name]) return streets[name];

    const {
        bestMatch: { target, rating },
    } = stringSimilarity.findBestMatch(name, Object.keys(streets));
    if (target && rating > 0.65) return streets[target];

    return config.SYRVE.streets.undefined;
};

export const prepareItems = (
    order: WoocommerceOrder,
    freeDelivery: boolean
): {
    items: IDeliveryItem[];
    notFoundItems: WoocommerceProduct[];
} => {
    const orderProducts = order.line_items;
    const nomenclature = database.getNomencalture();

    const notFoundItems: WoocommerceProduct[] = [];

    const items: IDeliveryItem[] = [];
    orderProducts.forEach((orderProduct) => {
        const [sku, requiredModifierCode] = orderProduct.sku.split("_");
        const syrveProduct = nomenclature.productByCodeMap[sku];

        if (syrveProduct) {
            const deliveryItem: IDeliveryItem = {
                productId: syrveProduct.id,
                type: "Product",
                amount: Number(orderProduct.quantity),
                modifiers: [],
            };

            if (orderProduct.meta_data.length) {
                if (isNumber(requiredModifierCode)) {
                    const modifierProduct = nomenclature.productByCodeMap[requiredModifierCode];
                    const modifier = createModifierFromProduct(modifierProduct);
                    deliveryItem.modifiers?.push(modifier);
                }

                orderProduct.meta_data.forEach(({ value }) => {
                    if (Array.isArray(value)) {
                        const modifierProduct = nomenclature.productByCodeMap[Object.values(value[0].value)[0].value];
                        const modifier = createModifierFromProduct(modifierProduct);
                        deliveryItem.modifiers?.push(modifier);
                    }
                });

                // required modifiers
                syrveProduct.groupModifiers
                    .filter((x) => x.required)
                    .filter((x) => !deliveryItem.modifiers?.find((pred) => pred.productGroupId === x.id))
                    .map((item) =>
                        deliveryItem.modifiers?.push({
                            productGroupId: item.id,
                            productId: item.childModifiers[0].id,
                            amount: 1,
                        })
                    );
            }
            items.push(deliveryItem);
        } else {
            notFoundItems.push(orderProduct);
        }
    });

    if (!freeDelivery || (items.length === 0 && notFoundItems.length > 0)) {
        items.push({
            productId: config.SYRVE.products.delivery,
            type: "Product",
            amount: 1,
        });
    }

    return { items, notFoundItems };
};

function createModifierFromProduct(modifierProduct: Syrve.Product): IModifier {
    return {
        productId: modifierProduct.id,
        productGroupId: modifierProduct.groupId,
        amount: 1,
    };
}

function isNumber(value: string | undefined): boolean {
    return value !== undefined && value !== null && value !== "" && !isNaN(Number(value.toString()));
}
