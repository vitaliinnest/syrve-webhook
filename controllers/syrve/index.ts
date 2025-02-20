import * as modules from "../../modules";
import { WoocommerceOrder, IDeliveryCreatePayload, PaymentTypeKind, OrderAddressKey, Syrve } from "../../types";
import { Request, Response } from "express";
import syrveApi from "../../modules/SyrveApi";
import config from "../../config";
import { format } from "date-fns-tz";

const webhook = async (req: Request, res: Response) => {
    if (req.body.test) {
        return res.status(200).send({ success: true });
    }

    if (req.body.webhook_id) {
        return res.status(200).send({ success: true });
    }

    const delivery = await createDeliveryObject(req.body);
    const [result, error] = await modules.to(syrveApi.createDeliveryAsync(delivery));

    if (error) {
        const ukraineTime = getUkraineTime();
        console.log(`\n-----delivery failed at ${ukraineTime}-----`);
        console.error(JSON.stringify(error, null, 2));
        return res.send({ success: false, error });
    }

    res.send(result);

    let statusOfDelivery: Syrve.DeliveryStatusResponse = { state: "InProgress" };
    const MAX_ATTEMPTS = 5;
    let attempts = 0;
    do {
        statusOfDelivery = await syrveApi.getStatusOfDeliveryAsync(result);
        attempts++;
        if (statusOfDelivery.state === "InProgress") {
            await modules.delay(3000);
        }
    } while (statusOfDelivery.state === "InProgress" && attempts <= MAX_ATTEMPTS);

    logDeliveryInfo(result, statusOfDelivery);
};

function logDeliveryInfo(result: any, statusOfDelivery: any) {
    const ukraineTime = getUkraineTime();
    console.log(`\n-----delivery created at ${ukraineTime}-----`);
    console.log(JSON.stringify(result, null, 2));

    console.log(`\n-----status of delivery at ${ukraineTime}-----`);
    console.log(JSON.stringify(statusOfDelivery, null, 2));
}

function getUkraineTime(): string {
    const timeZone = 'Europe/Kiev';
    return format(new Date(), 'dd.MM.yyyy HH:mm:ssXXX', { timeZone });
}

async function createDeliveryObject(order: WoocommerceOrder): Promise<IDeliveryCreatePayload> {
    const toDeliver = isDelivery(order);
    const freeDelivery = isFreeDelivery(order);

    const { items, notFoundItems } = modules.prepareItems(order, freeDelivery);
    const strNotFoundItems = notFoundItems.map((i) => i.name).join(", ");
    const street = modules.findStreet(order.billing.address_1);

    const address = getAddress(order);
    const strAddress = addressToString(address);
    const deliveryPoint = toDeliver
        ? {
              address: {
                  street: {
                      city: order.billing.city,
                      id: street,
                  },
                  house: address.house,
                  entrance: address.entrance,
                  floor: address.floor,
                  flat: address.flat,
              },
              comment: `${toDeliver ? "Доставка за адресою" : "Самовивіз"} \n${strAddress} \n${
                  order.payment_method_title
              }`,
          }
        : {};

    const paymentTypeKind = getPaymentTypeKind(order);
    return {
        organizationId: config.SYRVE.organizationId,
        terminalGroupId: config.SYRVE.terminalGroupId,
        order: {
            phone: order.billing.phone,
            items,
            deliveryPoint,
            orderTypeId: toDeliver
                ? config.SYRVE.order_types.deliveryByCourier
                : config.SYRVE.order_types.deliveryPickUp,
            comment: `Коментар клієнта: ${order.customer_note} | ${strAddress} | ${order.payment_method_title}${
                strNotFoundItems.length > 0 ? ` | Не знайдені товари: ${strNotFoundItems}` : ""
            }`,
            customer: { name: order.billing.first_name, type: "one-time" },
            payments: [
                {
                    paymentTypeKind,
                    sum: +order.total,
                    paymentTypeId: paymentTypeKind === "Card" ? config.SYRVE.payments.card : config.SYRVE.payments.cash,
                },
            ],
        },
    };
}

export default {
    webhook,
};

type Address = {
    street: string;
    house: string;
    entrance: string;
    flat: string;
    floor: string;
};

function isDelivery(order: WoocommerceOrder): boolean {
    if (order.shipping_lines.length > 0) return true;
    const shippingLine = order.shipping_lines[0];
    if (shippingLine.method_id === "flat_rate") return true;
    if (shippingLine.method_id === "free_shipping") return true;
    if (shippingLine.method_id === "local_pickup") return false;
    return true;
}

function isFreeDelivery(order: WoocommerceOrder): boolean {
    if (!isDelivery(order)) return false;
    const shippingLine = order.shipping_lines[0];
    return shippingLine.method_id === "free_shipping";
}

function getAddress(order: WoocommerceOrder): Address {
    const street = order.billing.address_1;
    const house = getOrderAddressValue("d_house");
    const entrance = getOrderAddressValue("d_paradnoe");
    const flat = getOrderAddressValue("d_room");
    const floor = getOrderAddressValue("d_etaj");

    return {
        street,
        house,
        entrance,
        flat,
        floor,
    };

    function getOrderAddressValue(key: OrderAddressKey): string {
        return order.meta_data.find((i) => i.key === key)?.value ?? "00";
    }
}

function getPaymentTypeKind(wcbody: WoocommerceOrder): PaymentTypeKind {
    switch (wcbody.payment_method) {
        case "cod":
            return "Cash";
        case "cheque":
        case "liqpay":
        case "liqpay-webplus":
            return "Card";
        default:
            return "Cash";
    }
}

function addressToString(address: Address): string {
    return `Вулиця: ${address.street}, Дім: ${address.house}, Під'їзд: ${address.entrance}, Квартира: ${address.flat}, Поверх: ${address.floor}`;
}
