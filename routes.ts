import { Express } from "express";

import controllers from "./controllers";

export default (app: Express) => {
    app.all('/syrve/webhook', controllers.syrve.webhook)
}