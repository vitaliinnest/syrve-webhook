import { Express } from "express";
import { database } from "./config/database";
import controllers from "./controllers";
import { to } from "./modules";

export default (app: Express) => {
    app.all("/syrve/webhook", controllers.syrve.webhook);

    app.get("/database/update", async (req, res) => {
        const [result, error] = await to(database.loadAll());
        if (error) return res.send({ success: false, error });

        res.send({ success: true });
    });

    app.get("/nomenclature", (req, res) =>
        res.send(database.getNomencalture)
    );
    app.get("/streets", (req, res) => res.send(database.get("streets")));
};
