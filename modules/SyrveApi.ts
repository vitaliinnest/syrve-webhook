import { ISyrveNomenclatureSpace, IDeliveryCreatePayload } from "../types";
import { AxiosInstance } from "axios";
import { to } from "./index";

import config from "../config";
import axios from "axios";

class SyrveApi {
    private axios: AxiosInstance;

    constructor() {
        this.axios = axios.create({
            baseURL: config.SYRVE.baseURL,
        });

        this.axios.defaults.headers["Content-Type"] = "application/json";

        this.axios.interceptors.request.use(
            (config) => config,
            (error) => error
        );
        this.axios.interceptors.response.use(
            (response) => response.data,
            (error) => error
        );
    }

    async access_token() {
        const [error, response = {}] = await to(
            axios.post(`https://api-eu.iiko.services/api/1/access_token`, {
                apiLogin: config.SYRVE.apiLogin,
            })
        );
        if (error) console.error(error);

        if (response.data?.token)
            this.axios.defaults.headers[
                "Authorization"
            ] = `Bearer ${response.data.token}`;
    }

    async createDelivery(payload: IDeliveryCreatePayload): Promise<any> {
        const [error, response] = await to(
            this.axios.post(`deliveries/create`, payload)
        );
        if (error) console.error(error);

        const status = response?.status || response?.response?.status;

        if (status === 401) {
            await this.access_token();

            return this.createDelivery(payload);
        }

        return response;
    }

    async nomenclature(): Promise<ISyrveNomenclatureSpace.RootObject> {
        const [error, response = {}] = await to(
            this.axios.post("nomenclature", {
                organizationId: config.SYRVE.organizationId,
            })
        );
        if (error) console.error(error);

        const status = response?.status || response?.response?.status;

        if (status === 401) {
            await this.access_token();

            return this.nomenclature();
        }

        return response;
    }

    async street(lang: "RU" | "UA" = "RU"): Promise<any> {
        const [error, response = {}] = await to(
            this.axios.post("streets/by_city", {
                cityId: config.SYRVE.cities[lang],
                organizationId: config.SYRVE.organizationId,
            })
        );
        if (error) console.error(error);

        const status = response?.status || response?.response?.status;

        if (status === 401) {
            await this.access_token();

            return this.street(lang);
        }

        return response.streets;
    }
}

export default new SyrveApi();
