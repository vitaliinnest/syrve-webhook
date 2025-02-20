import { Syrve, IDeliveryCreatePayload } from "../types";
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

    async getAccessTokenAsync() {
        const [response, error] = await to(
            axios.post(`https://api-eu.iiko.services/api/1/access_token`, {
                apiLogin: config.SYRVE.apiLogin,
            } as Syrve.AccessTokenPayload)
        );

        if (error) console.error(error);

        if (response.data?.token) this.axios.defaults.headers["Authorization"] = `Bearer ${response.data.token}`;
    }

    async createDeliveryAsync(payload: IDeliveryCreatePayload): Promise<Syrve.DeliveryCreatedPayload> {
        const [response, error] = await to(this.axios.post(`deliveries/create`, payload));
        if (error) console.error(error);

        const status = response?.status || response?.response?.status;

        if (status === 401) {
            await this.getAccessTokenAsync();
            return this.createDeliveryAsync(payload);
        }

        return response;
    }

    async loadNomenclatureAsync(): Promise<Syrve.RootObject> {
        const [response, error] = await to(
            this.axios.post("nomenclature", {
                organizationId: config.SYRVE.organizationId,
            })
        );

        if (error) console.error(error);

        const status = response?.status || response?.response?.status;

        if (status === 401) {
            await this.getAccessTokenAsync();
            return this.loadNomenclatureAsync();
        }

        return response;
    }

    async getStatusOfDeliveryAsync(deliveryPayload: Syrve.DeliveryCreatedPayload): Promise<any> {
        const [response, error] = await to(
            this.axios.post("commands/status", {
                organizationId: config.SYRVE.organizationId,
                correlationId: deliveryPayload.correlationId,
            })
        );

        if (error) console.error(error);

        const status = response?.status || response?.response?.status;

        if (status === 401) {
            await this.getAccessTokenAsync();
            return this.getStatusOfDeliveryAsync(deliveryPayload);
        }

        return response;
    }

    async loadStreetsAsync(lang: "RU" | "UA" = "RU"): Promise<any> {
        const [response, error] = await to(
            this.axios.post("streets/by_city", {
                cityId: config.SYRVE.cities[lang],
                organizationId: config.SYRVE.organizationId,
            })
        );
        if (error) console.error(error);

        const status = response?.status || response?.response?.status;

        if (status === 401) {
            await this.getAccessTokenAsync();
            return this.loadStreetsAsync(lang);
        }

        return response.streets;
    }
}

export default new SyrveApi();
