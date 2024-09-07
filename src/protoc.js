import fs from "fs";
import pbjs from "protobufjs-cli/pbjs.js";
import pbts from "protobufjs-cli/pbts.js";

pbjs.main([
    "-t",
    "json",
    "-p",
    "include",
    "-o",
    "src/proto.json",
    "--keep-case",
    "include/zachdeibert/led-controller/proto/editor_config.proto",
]);

let data = JSON.parse(fs.readFileSync("src/proto.json"));
data     = data.nested.zachdeibert.nested.led_controller.nested.proto;
fs.writeFileSync("src/proto.json", JSON.stringify(data));

pbjs.main([
    "-t",
    "static-module",
    "-o",
    "src/proto.js",
    "-w",
    "es6",
    "--dependency",
    "protobufjs/minimal.js",
    "--no-create",
    "--no-convert",
    "--no-delimited",
    "--no-typeurl",
    "--no-beautify",
    "--no-service",
    "src/proto.json",
]);

pbts.main([
    "-o",
    "src/proto.d.ts",
    "src/proto.js",
]);

fs.writeFileSync("src/proto-index.ts",
                 ([
                     "import * as proto from \"./proto\";\n",
                     "\n",
                     "export const block_oneof = {\n",
                 ]
                          .concat(
                                  ...data.nested.block.oneofs.implementation.oneof.map(
                                          field => `    "${field}": proto.${data.nested.block.fields[field].type},\n`),
                                  "};\n",
                                  ))
                         .join(""));
