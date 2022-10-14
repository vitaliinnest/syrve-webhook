import { Request, Response } from "express";
import config from "../../config";
import {IDeliveryCreatePayload, ITildaProduct} from "../../types";
import syrveApi from "../../modules/SyrveApi";
import {to} from "../../modules";

const webhook = async (req: Request, res: Response) => {
    console.log(JSON.stringify(req.body));

    if(req.body.test) return res.status(200).send({ success: true });

    const phone = req.body["phone"] || req.body["one_click"];
    console.log(`Phone: ${phone}`)

    if(!phone) {
        console.log(`Phone not found in body: `, phone)

        return res.status(200).send({ success: false, error: "Phone not found" });
    }

    const type = req.body["phone"] ? "full_order" : "one_click";
    console.log(`Type: ${type}`)

    const delivery = type === "one_click" ? oneClickOrder(phone) : await fullOrder(req.body);

    const [ error, result ] = await to(syrveApi.create_delivery(delivery));

    if(error) {
        console.error(error)

        return res.send( { success: false, error })
    }

    console.log(JSON.stringify(delivery, null, 2))

    console.log(JSON.stringify(result, null, 2))

    res.send(result)
}


function oneClickOrder(phone: string): IDeliveryCreatePayload {
    return {
        organizationId: config.SYRVE.organizationId,
        terminalGroupId: config.SYRVE.terminalGroupId,
        order: {
            phone,
            comment: "| NEW | ЗАКАЗ В ОДИН КЛИК | NEW |",
            orderTypeId: config.SYRVE.order_types.deliveryByCourier,
            deliveryPoint: {
                address: {
                    street: {
                        id: "78d6bf50-164e-408e-9638-c0133ea3c320"
                    },
                    house: "00"
                }
            },
            customer: {
                name: "| NEW | ЗАКАЗ В ОДИН КЛИК | NEW |",
                type: 'one-time'
            },
            payments: [],
            items: [
                {
                    productId: config.SYRVE.products.one_click,
                    price: 0,
                    type: 'Product',
                    amount: 1
                }
            ]
        }
    }
}

async function fullOrder(body: any): Promise<IDeliveryCreatePayload> {
    const { lang = "RU", name = "", phone = "", deliveryvar = "", dstreet = "", dcity = "Харьков", dhouse = "", dapt = "", comment = "", paymentsystem = "cash", payment = { amount: 0, products: [] } } = body;

    const productIds = await syrveApi.products(payment.products);

    const products = payment.products.reduce((array: any, row: ITildaProduct) => {
        const { price, quantity } = row;

        array.push({ productId: productIds[row.sku].id, modifiers: productIds[row.sku].modifiers.map((row: any) => ({ productId: row.id, productGroupId: row.productGroupId, amount: 1 })), price: +price, type: 'Product', amount: +quantity })

        return array;
    }, []);

    const street = await syrveApi.street(lang, dstreet);

    return {
        organizationId: config.SYRVE.organizationId,
        terminalGroupId: config.SYRVE.terminalGroupId,
        order: {
            orderTypeId: deliveryvar.includes('Доставка по адресу') ? config.SYRVE.order_types.deliveryByCourier : config.SYRVE.order_types.deliveryPickUp,
            phone,
            comment: comment ? `| NEW | ${comment} | NEW |` : "",
            customer: {
                name,
                type: "one-time"
            },
            deliveryPoint: {
                address: {
                    street: {
                        id: street
                    },
                    house: `${dhouse} ${dapt}`,
                },
                comment: `| NEW | ${deliveryvar} | NEW |\n${[dcity, dstreet, dhouse, dapt].filter(Boolean).join(', ')}\nОплата: ${ paymentsystem === "cash" ? "Cash" : "Card" }`
            },
            payments: [
                {
                    paymentTypeKind: "Card",
                    sum: +payment.amount,
                    paymentTypeId: config.SYRVE.payments.card
                }
            ],
            items: products
        }
    }
}

export default {
    webhook
}