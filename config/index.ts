interface IConfig {
    SYRVE: {
        baseURL: string;
        apiLogin: string;
        organizationId: string;
        terminalGroupId: string;
    }
}

const config: IConfig = {
    SYRVE: {
        baseURL: "https://api-eu.iiko.services/api/1/",
        apiLogin: "f305a494-3cd",
        organizationId: "ecaebd61-e4f7-46b7-ab02-8367249446e0",
        terminalGroupId: "a556d82b-38a9-d371-016f-3c7cfc8500cc",
    }
};

export default config;