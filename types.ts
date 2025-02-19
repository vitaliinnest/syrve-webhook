export interface ITildaOrder {
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
    products?: ProductsEntity[] | null;
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
    options?:
        | {
              option: string;
              variant: string;
          }[]
        | null;
}

export interface ISyrveAccessToken {
    correlationId: string;
    token: string;
}

export interface ISyrveOrganizations {
    correlationId: string;
    organizations?:
        | {
              responseType: string;
              id: string;
              name: string;
          }[]
        | null;
}

export type PaymentTypeKind = "Cash" | "Card";

type IDeliveryPoint = {
    address?: {
        street: {
            id: string;
            name?: string;
            city?: string;
        };
        house: string;
        flat?: string;
    };
    comment?: string;
};

type NewTypeIPayments =
    | {
          paymentTypeKind: PaymentTypeKind;
          sum: number;
          paymentTypeId: string;
      }[]
    | [];

type IDeliveryCreateOrderPayload = {
    orderTypeId: string;
    phone: string;
    deliveryPoint?: IDeliveryPoint;
    comment?: string;
    customer: {
        name: string;
        type: "one-time";
    };
    payments: NewTypeIPayments;
    items: IDeliveryItem[];
};

export interface IDeliveryCreatePayload {
    organizationId: string;
    terminalGroupId: string;
    order: IDeliveryCreateOrderPayload;
}

export type IModifier = {
    productId: string;
    name?: string;
    amount: number;
    productGroupId: string;
};

export interface IDeliveryItem {
    productId: string;
    type: "Product";
    price?: number;
    name?: string;
    amount: number;
    comment?: string;
    modifiers?: IModifier[];
}

export namespace ISyrveNomenclatureSpace {
    export interface Group {
        imageLinks: any[];
        parentGroup: string;
        order: number;
        isIncludedInMenu: boolean;
        isGroupModifier: boolean;
        id: string;
        code: string;
        name: string;
        description: string;
        additionalInfo?: any;
        tags: any[];
        isDeleted: boolean;
        seoDescription?: any;
        seoText?: any;
        seoKeywords?: any;
        seoTitle?: any;
    }

    export interface ProductCategory {
        id: string;
        name: string;
        isDeleted: boolean;
    }

    export interface Price {
        currentPrice: number;
        isIncludedInMenu: boolean;
        nextPrice?: any;
        nextIncludedInMenu: boolean;
        nextDatePrice?: any;
    }

    export interface SizePrice {
        sizeId?: any;
        price: Price;
    }

    export interface Modifier {
        id: string;
        defaultAmount: number;
        minAmount: number;
        maxAmount: number;
        required: boolean;
        hideIfDefaultAmount: boolean;
        splittable: boolean;
        freeOfChargeAmount: number;
    }

    export interface ChildModifier {
        id: string;
        defaultAmount: number;
        minAmount: number;
        maxAmount: number;
        required: boolean;
        hideIfDefaultAmount: boolean;
        splittable: boolean;
        freeOfChargeAmount: number;
    }

    export interface GroupModifier {
        id: string;
        minAmount: number;
        maxAmount: number;
        required: boolean;
        childModifiersHaveMinMaxRestrictions: boolean;
        childModifiers: ChildModifier[];
        hideIfDefaultAmount: boolean;
        defaultAmount: number;
        splittable: boolean;
        freeOfChargeAmount: number;
    }

    export interface Product {
        fatAmount: number;
        proteinsAmount: number;
        carbohydratesAmount: number;
        energyAmount: number;
        fatFullAmount: number;
        proteinsFullAmount: number;
        carbohydratesFullAmount: number;
        energyFullAmount: number;
        weight: number;
        groupId: string;
        productCategoryId: string;
        type: string;
        orderItemType: string;
        modifierSchemaId?: any;
        modifierSchemaName?: any;
        splittable: boolean;
        measureUnit: string;
        sizePrices: SizePrice[];
        modifiers: Modifier[];
        groupModifiers: GroupModifier[];
        imageLinks: string[];
        doNotPrintInCheque: boolean;
        parentGroup: string;
        order: number;
        fullNameEnglish: string;
        useBalanceForSell: boolean;
        canSetOpenPrice: boolean;
        id: string;
        code: string;
        name: string;
        description: string;
        additionalInfo?: any;
        tags: any[];
        isDeleted: boolean;
        seoDescription: string;
        seoText?: any;
        seoKeywords?: any;
        seoTitle?: any;
    }

    export interface RootObject {
        correlationId: string;
        groups: Group[];
        productCategories: ProductCategory[];
        products: Product[];
        productByIdMap: { [key: string]: Product };
        sizes: any[];
        revision: number;
    }
}

export interface WoocommerceOrder {
    id: number;
    parent_id: number;
    status: string;
    currency: string;
    version: string;
    prices_include_tax: boolean;
    date_created: Date;
    date_modified: Date;
    discount_total: string;
    discount_tax: string;
    shipping_total: string;
    shipping_tax: string;
    cart_tax: string;
    total: string;
    total_tax: string;
    customer_id: number;
    order_key: string;
    billing: WoocommerceBilling;
    shipping: WoocommerceBilling;
    payment_method: "cod" | "cheque" | "liqpay" | "liqpay-webplus";
    payment_method_title: string;
    transaction_id: string;
    customer_ip_address: string;
    customer_user_agent: string;
    created_via: string;
    customer_note: string;
    date_completed: null;
    date_paid: null;
    cart_hash: string;
    number: string;
    meta_data: AddressItem[];
    line_items: WoocommerceProduct[];
    tax_lines: any[];
    shipping_lines: ShippingLine[];
    fee_lines: any[];
    coupon_lines: any[];
    refunds: any[];
    payment_url: string;
    is_editable: boolean;
    needs_payment: boolean;
    needs_processing: boolean;
    date_created_gmt: Date;
    date_modified_gmt: Date;
    date_completed_gmt: null;
    date_paid_gmt: null;
    lang: "uk" | "ru";
    currency_symbol: string;
    _links: Links;
}

export interface Links {
    self: Collection[];
    collection: Collection[];
    customer: Collection[];
}

export interface Collection {
    href: string;
}

export interface WoocommerceBilling {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email?: string;
    phone: string;
}

export interface WoocommerceProduct {
    id: number;
    name: string;
    product_id: number;
    variation_id: number;
    quantity: number;
    tax_class: string;
    subtotal: string;
    subtotal_tax: string;
    total: string;
    total_tax: string;
    taxes: any[];
    meta_data: WoocommerceProductMetadata[];
    sku: string;
    price: number;
    image: Image;
    parent_name: string;
}

export interface Image {
    id: number;
    src: string;
}

export interface WoocommerceProductMetadata {
    id: number;
    key: string;
    value: DisplayValueElement[] | string;
    display_key: string;
    display_value: DisplayValueElement[] | string;
}

export interface DisplayValueElement {
    type: string;
    name: string;
    label: string;
    value: PurpleValue[];
    is_fee: boolean;
    is_show_price: boolean;
    price: boolean;
    quantity_depend: boolean;
    cur_swit: number;
    form_data: FormData;
    meta_id: number;
}

export interface FormData {
    type: string;
    elementId: string;
    label: string;
    priceOptions: string;
    pricingType: string;
    name: string;
    enableCl: boolean;
    cl_rule: string;
    cl_val: string;
    col: number;
    form_id: number;
    form_rules: FormRules;
    cl_status: string;
}

export interface FormRules {
    pric_cal_option_once: boolean;
    exclude_from_discount: boolean;
    pric_use_as_fee: boolean;
    fee_label: string;
    render_after_acb: boolean;
    disp_hide_options_price: boolean;
}

export interface PurpleValue {
    i: number;
    value: string;
    label: string;
}

export type OrderAddressKey = "d_house" | "d_paradnoe" | "d_room" | "d_etaj";

export interface AddressItem {
    id: number;
    key: OrderAddressKey;
    value: string;
}

export interface ShippingLine {
    id: number;
    method_title: string;
    method_id: "local_pickup" | "flat_rate" | "free_shipping";
    instance_id: string;
    total: string;
    total_tax: string;
    taxes: any[];
    meta_data: ShippingLineMetaData[];
}

export interface ShippingLineMetaData {
    id: number;
    key: string;
    value: string | MetaDataValue;
    display_key: string;
    display_value: string;
}

export interface MetaDataValue {
    type: string;
    name: string;
    label: string;
    value: { [key: string]: { label: string; value: string } };
    is_fee: boolean;
    is_show_price: boolean;
    price: { [key: string]: number };
    quantity_depend: boolean;
    cur_swit: number;
    form_data: FormData;
    meta_id: number;
}
