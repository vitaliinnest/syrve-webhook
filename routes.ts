import { Express } from "express";
import { database } from "./config/database";

import controllers from "./controllers";
import { to } from "./modules";

export default (app: Express) => {
    app.all("/syrve/webhook", controllers.syrve.webhook);

    app.get("/database/update", async (req, res) => {
        const [error, result] = await to(database.loadAll());
        if (error) return res.send({ success: false, error: error.message });

        res.send({ success: true });
    });

    app.get("/nomenclature", (req, res) =>
        res.send(database.get("nomenclature"))
    );
    app.get("/streets", (req, res) => res.send(database.get("streets")));
};
