import bodyParser from 'body-parser';
import express from 'express';
import routes from './routes';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

routes(app);

app.listen(3000, () => console.log(`Server listening on port 3000`))

// import syrveApi from './modules/SyrveApi';
// import { IOrderCreatePayload } from "./types";
// import config from "./config";

// (async () => {
    // let menu = await syrveApi.products();
        // @ts-ignore
    // menu = menu.products.filter(x => x.code.includes(967995872))
    //
    // @ts-ignore
    // console.log(menu[0])

    // const order: IOrderCreatePayload = {
    //     organizationId: "ecaebd61-e4f7-46b7-ab02-8367249446e0",
    //     terminalGroupId: "a556d82b-38a9-d371-016f-3c7cfc8500cc",
    //     order: {
    //             id: "",
    //             externalNumber: "string",
    //             items: [{
    //                 productId: "95c4a77c-3de8-43ea-94e9-62b6f0eaba45",
    //                 price: 100,
    //                 type: "Product",
    //                 amount: 1
    //             }],
    //             payments: [{
    //                 paymentTypeKind: "Cash",
    //                 sum: 100,
    //                 paymentTypeId: ""
    //             }],
    //             phone: "+380683311438"
    //     }
    // }

    // await syrveApi.order();
// })()