import express from "express";
import {createRequestHandler} from "@react-router/express";
import {RouterContextProvider} from "react-router";


const viteDevServer =
    process.env.NODE_ENV === "production"
        ? undefined
        : await import("vite").then((vite) =>
            vite.createServer({
                server: {middlewareMode: true},
            })
        );

const app = express();

// Static assets
if (viteDevServer) {
    app.use(viteDevServer.middlewares);
} else {
    app.use(
        "/assets",
        express.static("build/client/assets", {immutable: true, maxAge: "1y"})
    );
    app.use(express.static("build/client", {maxAge: "1h"}));
}

// SSR handler
const build = viteDevServer
    ? () => viteDevServer.ssrLoadModule("virtual:react-router/server-build")
    : await import("./build/server/index.js");

app.all(
    "*splat",
    createRequestHandler({
        build,
        getLoadContext() {
            // chỗ này để gắn thêm context (db, session...) nếu cần
            return new RouterContextProvider();
        },
    })
);

app.listen(3000, () => {
    console.log("Server chạy ở http://localhost:3000");
});