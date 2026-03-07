import { build, emptyDir } from "@deno/dnt";

await emptyDir("./npm");

await build({
    entryPoints: ["./mod.js"],
    outDir: "../npm-module",
    shims: {
        deno: false,
    },
    package: {
        name: "xp-lisp",
        version: Deno.args[0],
        description: "String function that returns where the cow says Hello nus3",
        license: "MIT",
        repository: {
            type: "git",
            url: "git+https://github.com/npm-module/xp-lisp.git",
        },
        bugs: {
            url: "https://github.com/npm-module/xp-lisp/issues",
        },
    },
    postBuild() {
        Deno.copyFileSync("../LICENSE", "../npm-module/LICENSE");
        Deno.copyFileSync("../README.md", "../npm-module/README.md");
    },
    typeCheck: false, // https://shogo82148.github.io/blog/2024/08/13/denoland-dnt-cannot-find-error-options/
});
