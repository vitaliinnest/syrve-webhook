import { IDeliveryCreatePayload } from "../types";
import { AxiosInstance } from "axios";
import { to } from "./index";

import config from "../config";
import axios from "axios";
import moment from "moment";

class SyrveApi {
    private axios: AxiosInstance;
    private token: { datetime: any; value: any };

    constructor() {
        this.axios = axios.create({
            baseURL: config.SYRVE.baseURL
        })

        this.axios.defaults.headers["Content-Type"] = "application/json";

        this.axios.interceptors.request.use((config) => {
            if(!this.token.value || moment().utc().isAfter(moment(this.token.datetime).add('15', 'minutes'))) {
                return this.access_token()
                    .then((token) => {
                        if(config.headers) config.headers['Authorization'] = `Bearer ${token}`;

                        return Promise.resolve(config)
                    })
                    .catch((error) => Promise.reject(error))
            }

            if(config.headers) config.headers['Authorization'] = `Bearer ${this.token.value}`;

            return config;
        }, (error) => error)
        this.axios.interceptors.response.use((response) => response.data, (error) => error)

        this.token = {
            value: null,
            datetime: null
        }
    }

    async access_token() {
        const [ error, response = {} ] = await to(axios.post(`https://api-eu.iiko.services/api/1/access_token`, { apiLogin: config.SYRVE.apiLogin }));
        if(error) console.error(error);

        if(response.data.token) {
            this.token = { value: response.data.token, datetime: moment().utc()}

            return response.data.token;
        }

        return "";
    }

    async create_delivery(payload: IDeliveryCreatePayload) {
        const [ error, response ] = await to(this.axios.post(`deliveries/create`, payload));
        if(error) console.error(error);

        return response;
    }

    async products(products: any[]) {
        const [ error, response = {} ] = await to(this.axios.post('nomenclature', { organizationId: config.SYRVE.organizationId }));
        if(error) console.error(error)

        if(!response.products || !response.products.length) return {};

        function findProduct(sku: string, nomenclature: any) {
            const [ SKU, language ] = sku.split("_");
            if(!["UKR", "RUS"].includes(language)) return;

            let item = nomenclature.products.filter((pred: any) => pred.code.includes(SKU));

            return item.filter((row: any) => {
                const group = nomenclature.groups.find((x: any) => x.id === row.parentGroup)

                //@ts-ignore
                return group.parentGroup === config.SYRVE.menu_lang[language]
            })
        }

        function findModifiers(product: any, options: any, nomenclature: any) {
            return product.groupModifiers
                .filter((x: any) => x.required)
                .map(({ id: productGroupId, childModifiers }: any) => {
                    const modifier = childModifiers.find((childModifier: any) => {
                        const modifier = nomenclature.products.find((x: any) => x.id === childModifier.id);

                        return Object.keys(modifier).length && options.map(({ variant }: any) => variant).includes(modifier.name);
                    });

                    if(modifier) return { ...modifier, productGroupId }
                    else return { ...childModifiers[0], productGroupId }
                }).filter(Boolean)
        }

        return products.reduce((object: any, row: any) => {
            const item = findProduct(row.sku, response);

            if(item.length && !object[row]) {
                const modifiers = findModifiers(item[0], row.options, response);

                object[row.sku] = { id: item[0].id, modifiers }
            }

            return object;
        }, {})
    }

    async street(lang: "RU" | "UA" = 'RU', name: string) {
        const [ error, response = {} ] = await to(this.axios.post('streets/by_city', { cityId: config.SYRVE.cities[lang], organizationId: config.SYRVE.organizationId }));
        if(error) console.error(error);

        if(response.streets && response.streets.length) {
            const street = response.streets.filter((x: any) => x.name.includes(name));
            if(street.length === 1) return street[0].id;
        }

        return "78d6bf50-164e-408e-9638-c0133ea3c320";
    }
}

export default new SyrveApi();