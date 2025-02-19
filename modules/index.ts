import { IDeliveryItem, ISyrveNomenclatureSpace, WoocommerceOrder, WoocommerceProduct } from "../types";
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
    const nomenclature: ISyrveNomenclatureSpace.RootObject = database.getNomencalture();

    const notFoundItems: WoocommerceProduct[] = [];
    const items = orderProducts.reduce((array: IDeliveryItem[], orderProduct) => {
        const [sku, pizzaModifier] = orderProduct.sku.split("_");
        const syrveProduct = nomenclature.products.find((p) => p.code === sku);

        if (syrveProduct) {
            newFunction(syrveProduct, orderProduct, nomenclature, array);
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

function newFunction(
    syrveProduct: ISyrveNomenclatureSpace.Product,
    orderProduct: WoocommerceProduct,
    nomenclature: ISyrveNomenclatureSpace.RootObject,
    array: IDeliveryItem[]
) {
    const deliveryItem: IDeliveryItem = {
        productId: syrveProduct.id,
        type: "Product",
        amount: Number(orderProduct.quantity),
    };

    if (orderProduct.meta_data.length) {
        const modifiers = syrveProduct.groupModifiers
            .map(({ childModifiers, id, ...row }: any) => {
                childModifiers = childModifiers.map((row: any) => nomenclature.products.find((x) => x.id === row.id));
                childModifiers = childModifiers.map((row: any) => ({
                    ...row,
                    productGroupId: id,
                }));
                return childModifiers;
            })
            .flat();

        // deliveryItem.modifiers = orderProduct.meta_data.reduce(
        //     (array: any[], { key, value }) => {
        //         if (Array.isArray(value) || value === "") return array;
        //         const { bestMatch } = stringSimilarity.findBestMatch(
        //             value,
        //             modifiers.map((row) => row.name)
        //         );
        //         if (!bestMatch.target) return array;

        //         const modifier = modifiers.find(
        //             (x) => x.name === bestMatch.target
        //         );
        //         console.log("modifier");
        //         console.log(JSON.stringify(modifier, null, 2));
        //         if (modifier) {
        //             array.push({
        //                 productId: modifier.id,
        //                 productGroupId: modifier.productGroupId,
        //                 amount: 1,
        //             });
        //         }

        //         return array;
        //     },
        //     []
        // );

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
}
