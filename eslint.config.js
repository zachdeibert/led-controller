import eslint from "@eslint/js";
import tselint from "typescript-eslint";

export default tselint.config(
        {
            "ignores" : [
                "_old/*",
                "_site/*",
                "module/*",
                "src/proto.d.ts",
                "src/proto.js",
                "src/protoc.js",
                "*.config.js",
            ],
},
        eslint.configs.recommended,
        ...tselint.configs.strictTypeChecked,
        ...tselint.configs.stylisticTypeChecked,
        {
            "languageOptions" : {
                "parserOptions" : {
                    "projectService" : true,
                    "tsconfigRootDir" : import.meta.dirname,
                },
            },
            "rules" : {
                "@typescript-eslint/no-empty-function" : [
                    "error",
                    {
                        "allow" : [
                            "arrowFunctions",
                        ],
                    },
                ],
                "@typescript-eslint/no-non-null-assertion" : [
                    "off",
                ],
                "@typescript-eslint/restrict-template-expressions" : [
                    "error",
                    {
                        "allowNumber" : true,
                    },
                ],
            },
        },
);
