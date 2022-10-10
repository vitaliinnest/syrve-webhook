import { Request, Response } from "express";

const webhook = async (req: Request, res: Response) => {
    console.log(JSON.stringify(req.body));

    res.send({ success: true })
}

export default {
    webhook
}