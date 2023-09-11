interface IConfig {
    SYRVE: {
        baseURL: string;
        apiLogin: string;
        organizationId: string;
        terminalGroupId: string;
        menu_lang: {
            UKR: string;
            RUS: string;
        };
        streets: {
            undefined: string;
        };
        cities: {
            UA: string;
            RU: string;
        };
        products: {
            one_click: string;
            delivery: string;
        };
        payments: {
            bonus: string;
            card: string;
            cash: string;
        };
        order_types: {
            deliveryPickUp: string;
            deliveryByCourier: string;
            common: string;
        };
    }
}

const config: IConfig = {
    SYRVE: {
        baseURL: "https://api-eu.iiko.services/api/1/",
        apiLogin: "f305a494-3cd",
        organizationId: "ecaebd61-e4f7-46b7-ab02-8367249446e0",
        terminalGroupId: "a556d82b-38a9-d371-016f-3c7cfc8500cc",
        menu_lang: {
            UKR: "fa826cdd-9b44-4cd7-b1c7-f2ed736b956e",
            RUS: "66b85226-49f8-43fd-9764-a4da6a3cc178"
        },
        streets: {
            undefined: "78d6bf50-164e-408e-9638-c0133ea3c320"
        },
        cities: {
            RU: "9954a54d-ed99-ce55-0182-3b21dc2760cf",
            UA: "9954a54d-ed99-ce55-0182-3b21dc2796e6"
        },
        products: {
            one_click: "6e5c95a1-a6f0-4348-9922-5f7186383577",
            delivery: "e5f630b2-84c5-4a79-9072-9f614ab3be4c"
        },
        order_types: {
            deliveryPickUp: "5b1508f9-fe5b-d6af-cb8d-043af587d5c2",
            deliveryByCourier: "76067ea3-356f-eb93-9d14-1fa00d082c4e",
            common: "bbbef4dc-5a02-7ea3-81d3-826f4e8bb3e0",
        },
        payments: {
            bonus: "05828912-c15e-4e6d-a5f7-09e551d809d7",
            card: "9cd5d67a-89b4-ab69-1365-7b8c51865a90",
            cash: "09322f46-578a-d210-add7-eec222a08871"
        }
    }
};

export default config;