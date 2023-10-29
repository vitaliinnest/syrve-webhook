import { IDeliveryItem, ISyrveNomenclatureSpace, WoocommerceOrder, WoocommerceProduct } from "../types";
import { database } from "../config/database";

import stringSimilarity = require("string-similarity");
import config from "../config";

export const to = (promise: Promise<any>) => promise.then((data) => [null, data]).catch((error) => [error]);

export const findStreet = (name: string): string => {
    const streets: any = database.get('streets');
    if (streets[name]) return streets[name];

    const { bestMatch: { target, rating } } = stringSimilarity.findBestMatch(name, Object.keys(streets));
    if (target && rating > 0.65) return streets[target]

    return config.SYRVE.streets.undefined;
}

export const prepareItems = (order: WoocommerceOrder, freeDelivery: boolean): {
    items: IDeliveryItem[];
    notFoundItems: WoocommerceProduct[];
} => {
    const products = order.line_items;
    const nomenclature: ISyrveNomenclatureSpace.RootObject = database.get('nomenclature');
    const notFoundItems: WoocommerceProduct[] = [];

    const items = products.reduce((array: IDeliveryItem[], product) => {
        let [ SKU, language ]: any[] = product.sku.split('_');
        if (language === undefined || !['UKR', 'RUS'].includes(language)) {
            language = order.lang === "uk" ? "UKR" : "RUS";
        }

        const predicates = nomenclature.products.filter((pred) => pred.code.includes(SKU))

        const [desired] = predicates.filter((row) => {
            const group = nomenclature.groups.find((pred) => pred.id === row.parentGroup);
            // @ts-ignore
            return group.parentGroup === config.SYRVE.menu_lang[language];
        })

        if (desired) {
            const deliveryItem: IDeliveryItem = {
                productId: desired.id,
                type: 'Product',
                amount: Number(product.quantity)
            };

            if (product.meta_data.length) {
                const modifiers = desired.groupModifiers.map(({ childModifiers, id, ...row }: any) => {
                    childModifiers = childModifiers.map((row: any) => nomenclature.products.find((x) => x.id === row.id));
                    childModifiers = childModifiers.map((row: any) => ({ ...row, productGroupId: id }));
                    return childModifiers;
                }).flat();

                deliveryItem.modifiers = product.meta_data.reduce((array: any[], { key, value }) => {
                    if (Array.isArray(value) || value === '') return array;
                    const { bestMatch } = stringSimilarity.findBestMatch(value, modifiers.map((row) => row.name));
                    if (!bestMatch.target) return array;

                    const modifier = modifiers.find((x) => x.name === bestMatch.target);

                    if (modifier) {
                        array.push({
                            productId: modifier.id,
                            productGroupId: modifier.productGroupId,
                            amount: 1
                        });
                    }

                    return array;
                }, []);

                // required modifiers
                desired.groupModifiers
                    .filter((x) => x.required)
                    .filter((x) => !deliveryItem.modifiers?.find((pred) => pred.productGroupId === x.id))
                    .map((item) => deliveryItem.modifiers?.push({
                        productGroupId: item.id,
                        productId: item.childModifiers[0].id,
                        amount: 1
                    }));
            }

            if (!array.find((pred) => pred.productId === desired.id)) {
                array.push(deliveryItem);
            }
        } else {
            notFoundItems.push(product);
        }
        return array;
    }, []);

    if (!freeDelivery || items.length === 0 && notFoundItems.length > 0) {
        items.push({
            productId: config.SYRVE.products.delivery,
            type: "Product",
            amount: 1
        });
    }

    return { items, notFoundItems };
}
