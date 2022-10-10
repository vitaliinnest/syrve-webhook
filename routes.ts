import { Express } from "express";

import controllers from "./controllers";

export default (app: Express) => {
    app.post('/syrve/webhook', controllers.syrve.webhook)
}