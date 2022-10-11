interface IConfig {
    SYRVE: {
        baseURL: string;
        apiLogin: string;
        organizationId: string;
        terminalGroupId: string;
        products: {
            one_click: string;
        }
        payments: {
            bonus: string;
            card: string;
            cash: string;
        }
        order_types: {
            deliveryPickUp: string;
            deliveryByCourier: string;
            common: string;
        }
        forms: {
            "one-click": string;
            "full-order": string;
        };
    }
}

const config: IConfig = {
    SYRVE: {
        baseURL: "https://api-eu.iiko.services/api/1/",
        apiLogin: "f305a494-3cd",
        organizationId: "ecaebd61-e4f7-46b7-ab02-8367249446e0",
        terminalGroupId: "a556d82b-38a9-d371-016f-3c7cfc8500cc",
        products: {
            one_click: "6e5c95a1-a6f0-4348-9922-5f7186383577"
        },
        order_types: {
            deliveryPickUp: "5b1508f9-fe5b-d6af-cb8d-043af587d5c2",
            deliveryByCourier: "76067ea3-356f-eb93-9d14-1fa00d082c4e",
            common: "bbbef4dc-5a02-7ea3-81d3-826f4e8bb3e0",
        },
        payments: {
            bonus: "05828912-c15e-4e6d-a5f7-09e551d809d7",
            card: "9cd5d67a-89b4-ab69-1365-7b8c51865a90",
            cash: "3a091e19-38e9-47ed-88b2-728c4b0bfbf8"
        },
        forms: {
            "one-click": "form203237500",
            "full-order": "form195630154"
        }
    }
};

export default config;