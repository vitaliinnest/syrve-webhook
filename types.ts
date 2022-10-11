export interface IOrder {
    name: string;
    one_click?: string;
    mark: string;
    lang: string;
    phone: string;
    deliveryvar: string;
    dcity: string;
    dstreet: string;
    dhouse: string;
    dapt: string;
    comment: string;
    paymentsystem: string;
    payment: Payment;
    formid: string;
    formname: string;
}

export interface Payment {
    orderid: string;
    products?: (ProductsEntity)[] | null;
    amount: string;
    subtotal: string;
    delivery: string;
    delivery_price: string;
    delivery_fio: string;
    delivery_address: string;
    delivery_comment: string;
}

export interface ProductsEntity {
    name: string;
    quantity: string;
    amount: string;
    price: string;
    sku: string;
    options?: (OptionsEntity)[] | null;
}

export interface OptionsEntity {
    option: string;
    variant: string;
}

export interface ISyrveAccessToken {
    correlationId: string;
    token: string
}

export interface ISyrveOrganizations {
    correlationId: string;
    organizations?: (OrganizationsEntity)[] | null;
}
export interface OrganizationsEntity {
    responseType: string;
    id: string;
    name: string;
}

export interface IOrderCreatePayload {
    organizationId: string;
    terminalGroupId: string;
    order: {
        id: string;
        externalNumber: string;
        customer?: {
          id?: string;
          name?: string;
          surname?: string;
          comment?: string;
          email?: string;
          shouldReceiveOrderStatusNotifications?: boolean;
          type?: "regular" | "one-time";
        };
        items: {
            productId: string;
            price: number;
            type: "Product" | "Compound";
            amount: number;
        }[];
        payments: {
            paymentTypeKind: "Cash" | "Card"
            sum: number;
            paymentTypeId: string;
        }[] | [];
        phone: string;
    }
}


export interface IDeliveryCreatePayload {
    organizationId: string;
    terminalGroupId: string;
    order: {
        orderTypeId: string;
        phone: string;
        deliveryPoint?: {
            address?: {
                street: {
                    name: string;
                    city: string;
                };
                house: string;
            }
            comment?: string;
        }
        comment?: string;
        customer: {
            name: string;
            type: 'one-time'
        };
        payments: {
            paymentTypeKind: "Cash" | "Card"
            sum: number;
            paymentTypeId: string;
        }[] | [];
        items: {
            productId: string;
            price: number;
            type: "Product" | "Compound";
            amount: number;
            comment?: string;
        }[];
    }
}

export interface ITildaProduct {
    name: string;
    quantity: string;
    amount: string;
    price: string;
    sku: string;
    options?: (OptionsEntity)[] | null;
}
export interface OptionsEntity {
    option: string;
    variant: string;
}
