import { Request, Response } from "express";
import config from "../../config";
import {IDeliveryCreatePayload, ITildaProduct} from "../../types";
import syrveApi from "../../modules/SyrveApi";
import {to} from "../../modules";

const webhook = async (req: Request, res: Response) => {
    if(!req.body.formid || !Object.values(config.SYRVE.forms).includes(req.body.formid)) return res.status(404).send({ success: false, error: "FormID not found in config" });

    console.log(JSON.stringify(req.body));

    const phone = (() => {
        switch (req.body.formid) {
            case (config.SYRVE.forms["full-order"]): return req.body.phone;
            case (config.SYRVE.forms["one-click"]):  return req.body["one_click"];
        }
    })();

    const delivery = req.body.formid === config.SYRVE.forms["one-click"] ? oneClickOrder(phone) : await fullOrder(req.body);

    const [ error, result ] = await to(syrveApi.create_delivery(delivery));

    if(error) {
        console.error(error)

        return res.send( { success: false, error })
    }

    console.log(result)

    res.send(result)
}


function oneClickOrder(phone: string): IDeliveryCreatePayload {
    return {
        organizationId: config.SYRVE.organizationId,
        terminalGroupId: config.SYRVE.terminalGroupId,
        order: {
            phone,
            comment: "| ЗАКАЗ В ОДИН КЛИК |",
            orderTypeId: config.SYRVE.order_types.deliveryByCourier,
            customer: {
                name: "One Click Order",
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
    const productIds = await syrveApi.products(body.payment.products.map((row: any) => row.sku));

    const products = body.payment.products?.reduce((array: any, row: ITildaProduct) => {
        const { options, price, quantity } = row;

        const comment = Array.isArray(options) ? options.map(({ option, variant }) => `${option}: ${variant}`).join(' - ') : "";

        array.push({ productId: productIds[row.sku], price: +price, type: 'Product', amount: +quantity, comment })

        return array;
    }, []);


    return {
        organizationId: config.SYRVE.organizationId,
        terminalGroupId: config.SYRVE.terminalGroupId,
        order: {
            orderTypeId: body.deliveryvar.includes('Доставка по адресу') ? config.SYRVE.order_types.deliveryByCourier : config.SYRVE.order_types.deliveryPickUp,
            phone: body.phone,
            comment: body.comment || "",
            customer: {
                name: body.name || "Not passed",
                type: "one-time"
            },
            deliveryPoint: {
                address: {
                    street: {
                        name: body.dstreet,
                        city: body.dcity
                    },
                    house: body.dhouse || "",
                },
                comment: body.deliveryvar
            },
            payments: [
                {
                    paymentTypeKind: body.paymentsystem === "cash" ? "Cash" : "Card",
                    sum: +body.payment.amount,
                    paymentTypeId: body.paymentsystem === "cash" ? config.SYRVE.payments.cash : config.SYRVE.payments.card
                }
            ],
            items: products
        }
    }
}

export default {
    webhook
}