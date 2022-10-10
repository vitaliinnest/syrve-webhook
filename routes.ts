import { Express } from "express";

import controllers from "./controllers";

export default (app: Express) => {
    app.get('/syrve/webhook', controllers.syrve.webhook)
    app.post('/syrve/webhook', controllers.syrve.webhook)
}