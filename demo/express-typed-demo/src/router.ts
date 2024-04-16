import {TypedRouter} from "express-typed";

const typedRouter = new TypedRouter({
    "/": {
        get: (req, res) => {
            return res.send("Typesafe Route!").status(200);
        },
        post: (req, res) => {
            return res.send(req.body).status(200);
        },
    },
    "/test": {
        get: (req, res) => {
            return res.send("TEST! Typesafe Route!").status(200);
        },
    },
});

export type TypedRoutes = (typeof typedRouter)['routes'];

export default typedRouter;
