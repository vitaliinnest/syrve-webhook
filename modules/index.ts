import { IDeliveryItem, IModifier, WoocommerceOrder, WoocommerceProduct } from "../types";
import { database } from "../config/database";
import config from "../config";

export const to = (promise: Promise<any>) => promise.then((data) => [null, data]).catch((error) => [error]);

export const findStreet = (name: string): string => {
    const streets: any = database.get("streets");
    if (streets[name]) return streets[name];

    // const {
    //     bestMatch: { target, rating },
    // } = stringSimilarity.findBestMatch(name, Object.keys(streets));
    // if (target && rating > 0.65) return streets[target];

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

    const deliveryItems: IDeliveryItem[] = [];
    orderProducts.forEach((orderProduct) => {
        const [sku, requiredModifier] = orderProduct.sku.split("_");
        const syrveProduct = nomenclature.productByCodeMap[sku];

        if (syrveProduct) {
            const deliveryItem: IDeliveryItem = {
                productId: syrveProduct.id,
                type: "Product",
                amount: Number(orderProduct.quantity),
                modifiers: [],
            };

            if (orderProduct.meta_data.length) {
                if (isNumber(requiredModifier)) {
                    const modifierProduct = nomenclature.productByCodeMap[requiredModifier];
                    const modifier: IModifier = {
                        name: modifierProduct.name,
                        productId: modifierProduct.id,
                        amount: 1,
                        productGroupId: syrveProduct.groupModifiers[0].id,
                    };
                    deliveryItem.modifiers?.push(modifier);
                }

                orderProduct.meta_data.forEach(({ value }) => {
                    if (Array.isArray(value)) {
                        const modifierProduct = nomenclature.productByCodeMap[Object.values(value[0].value)[0].value];
                        const modifier: IModifier = {
                            name: modifierProduct.name,
                            productId: modifierProduct.id,
                            amount: 1,
                            productGroupId: syrveProduct.groupModifiers[0].id,
                        };
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
            deliveryItems.push(deliveryItem);
        } else {
            notFoundItems.push(orderProduct);
        }
    });

    const items = orderProducts.reduce((array: IDeliveryItem[], orderProduct) => {
        const [sku, requiredModifier] = orderProduct.sku.split("_");

        const syrveProduct = nomenclature.productByCodeMap[sku];

        if (syrveProduct) {
            const deliveryItem: IDeliveryItem = {
                productId: syrveProduct.id,
                type: "Product",
                amount: Number(orderProduct.quantity),
                modifiers: [],
            };

            if (orderProduct.meta_data.length) {
                if (isNumber(requiredModifier)) {
                    const modifierProduct = nomenclature.productByCodeMap[requiredModifier];
                    const modifier: IModifier = {
                        name: modifierProduct.name,
                        productId: modifierProduct.id,
                        amount: 1,
                        productGroupId: syrveProduct.groupModifiers[0].id,
                    };
                    deliveryItem.modifiers?.push(modifier);
                }

                orderProduct.meta_data.forEach(({ value }) => {
                    if (Array.isArray(value)) {
                        const modifierProduct = nomenclature.productByCodeMap[Object.values(value[0].value)[0].value];
                        const modifier: IModifier = {
                            name: modifierProduct.name,
                            productId: modifierProduct.id,
                            amount: 1,
                            productGroupId: syrveProduct.groupModifiers[0].id,
                        };
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

            if (!array.find((pred) => pred.productId === syrveProduct.id)) {
                array.push(deliveryItem);
            }
        } else {
            notFoundItems.push(orderProduct);
        }
        return array;
    }, []);

    if (!freeDelivery || (items.length === 0 && notFoundItems.length > 0)) {
        items.push({
            productId: config.SYRVE.products.delivery,
            type: "Product",
            amount: 1,
        });
    }

    return { items, notFoundItems };
};

function isNumber(value: string | undefined): boolean {
    return value !== undefined && value !== null && value !== "" && !isNaN(Number(value.toString()));
}
