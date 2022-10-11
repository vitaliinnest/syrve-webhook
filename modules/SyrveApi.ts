import {IDeliveryCreatePayload, IOrderCreatePayload, ISyrveAccessToken, ISyrveOrganizations} from "../types";
import { AxiosInstance } from "axios";
import config from "../config";
import axios from "axios";

class SyrveApi {
    private axios: AxiosInstance;
    private token: string;

    constructor() {

        this.axios = axios.create({
            baseURL: config.SYRVE.baseURL,
        })

        this.axios.defaults.headers["Content-Type"] = "application/json";

        this.axios.interceptors.response.use((response) => response.data, (error) => error)
        this.token = "";
    }

    async access_token() {
        const response: ISyrveAccessToken = await this.axios.post('access_token', { apiLogin: config.SYRVE.apiLogin });
        if(!response?.token) return;

        this.axios.defaults.headers['Authorization'] = `Bearer ${response.token}`;
    }

    async create_delivery(payload: IDeliveryCreatePayload) {
        await this.access_token();

        return this.axios.post(`deliveries/create`, payload)
    }

    async products(SKU: string[]) {
        await this.access_token();

        const response: any = await this.axios.post('nomenclature', { organizationId: config.SYRVE.organizationId });

        return SKU.reduce((object: any, row: string) => {
            const item = response.products.filter((pred: any) => pred.code.includes(row.split("_")[0]));
            if(item && !object[row]) object[row] = item[0].id;

            return object;
        }, {})
    }

    async organizations(): Promise<ISyrveOrganizations> {
        await this.access_token();

        return this.axios.post('organizations', {})
    }
}

export default new SyrveApi();