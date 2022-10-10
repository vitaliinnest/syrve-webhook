import {IOrderCreatePayload, ISyrveAccessToken, ISyrveOrganizations} from "../types";
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

    async products(SKU: string) {
        await this.access_token();

        return this.axios.post('nomenclature', { organizationId: config.SYRVE.organizationId });
    }

    async organizations(): Promise<ISyrveOrganizations> {
        await this.access_token();

        return this.axios.post('organizations', {})
    }

    async order(payload: IOrderCreatePayload) {
        await this.access_token();

        return this.axios.post(`order/create`)
    }
}

export default new SyrveApi();