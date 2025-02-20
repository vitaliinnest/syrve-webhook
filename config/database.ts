import SyrveApi from "../modules/SyrveApi";
import { Syrve } from "../types";

const config: any = {
    streets: { load: () => loadStreets(), data: null },
    nomenclature: { load: () => SyrveApi.loadNomenclatureAsync(), data: null },
};

export const database = {
    loadAll: async () => {
        for (const [key, value] of Object.entries(config)) {
            const { load }: any = value;
            config[key].data = await load();
        }
    },
    get: (param: string) => config[param].data,
    getNomencalture: (): Syrve.RootObject => {
        const nomenclature = database.get("nomenclature") as Syrve.RootObject;
        nomenclature.productByCodeMap = nomenclature.products.reduce((map, product) => {
            map[product.code] = product;
            return map;
        }, {} as Syrve.ProductDictionary);
        return nomenclature;
    },
};

async function loadStreets() {
    const RU = await SyrveApi.loadStreetsAsync("RU");
    const UA = await SyrveApi.loadStreetsAsync("UA");

    return [...RU, ...UA].reduce((streets, row) => {
        streets[row.name] = row.id;
        return streets;
    }, {});
}
