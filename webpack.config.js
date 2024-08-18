import css_minimizer_webpack_plugin from "css-minimizer-webpack-plugin";
import html_webpack_plugin from "html-webpack-plugin";
import mini_css_extract_plugin from "mini-css-extract-plugin";
import path from "path";
import terser_webpack_plugin from "terser-webpack-plugin";

export default {
        "devtool": "source-map",
        "entry": "./src/index.ts",
        "mode": "production",
        "module": {
                   "rules":
                    [
                        {
                            "test" : /\.css$/,
                            "use" : [
                                mini_css_extract_plugin.loader,
                                "css-loader",
                            ],
                        }, {
                            "exclude" : /node_modules/,
                            "test" : /\.ts$/,
                            "use" : "ts-loader",
                        }, ],
                   },
        "optimization": {
                   "minimizer":
                    [
                        new css_minimizer_webpack_plugin(),
                   new terser_webpack_plugin(),
                   ], "splitChunks": {
                "chunks": "all",
            }, },
        "output": {
                   "clean": true,
                   "path": path.resolve(import.meta.dirname, "_site"),
                   },
        "performance": {
                   "hints": false,
                   },
        "plugins":
                [
                    new html_webpack_plugin({
                   "inject" : "head",
                   "meta" : {
                            "application-name" : "LED Controller Configuration",
                            "author" : "Zach Deibert",
                            "description" : "A project to control LEDs for various applications",
                            "keywords" : "ARGB, LED, Neopixel, Pico, RGB, WS2811, WS2812",
                            "viewport" :
                                    "width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no",
                        }, "scriptLoading" : "blocking",
                   "template" : "src/editor/editor.html",
                   "title" : "LED Controller Configuration",
                   }
         ),
                    new mini_css_extract_plugin(),
                ],
        "resolve": {
                   "extensions":
                    [
                        ".js", ".ts",
                   ], },
};
