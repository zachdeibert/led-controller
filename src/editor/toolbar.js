"use strict";

class led_controller_toolbar {
        /**
         * @type {[string, typeof led_controller_block][]}
         */
        static #led_output_blocks = [];

        /**
         * @type {[string, typeof led_controller_block][]}
         */
        static #control_input_blocks = [];

        /**
         * @type {[string, typeof led_controller_block][]}
         */
        static #processing_blocks = [];

        /**
         * @type {[string, typeof led_controller_block][]}
         */
        static #generator_blocks = [];

        /**
         * @type {[string, typeof led_controller_block][]}
         */
        static #utility_blocks = [];

        static #dom_loaded = false;

        static {
            document.addEventListener("DOMContentLoaded", () => {
                const editor_add_menu             = document.getElementById("editor-add-menu");
                const editor_group_control_inputs = document.getElementById("editor-group-control-inputs");
                const editor_group_generators     = document.getElementById("editor-group-generators");
                const editor_group_led_outputs    = document.getElementById("editor-group-led-outputs");
                const editor_group_processing     = document.getElementById("editor-group-processing");
                const editor_group_utilities      = document.getElementById("editor-group-utilities");

                this.#dom_loaded = true;

                M.Collapsible.init([ editor_add_menu ], { "accordion" : false });
                const sidenav = M.Sidenav.init([ editor_add_menu ], { "edge" : "right" })[0];
                M.Tooltip.init(document.querySelectorAll(".tooltipped"), {});

                [[ this.#led_output_blocks, editor_group_led_outputs ],
                 [ this.#control_input_blocks, editor_group_control_inputs ],
                 [ this.#processing_blocks, editor_group_processing ],
                 [ this.#generator_blocks, editor_group_generators ],
                 [ this.#utility_blocks, editor_group_utilities ]]
                        .forEach(args => {
                            /**
                             * @type {[string, typeof led_controller_block][]}
                             */
                            const blocks       = args[0];
                            /**
                             * @type {HTMLElement}
                             */
                            const editor_group = args[1];

                            blocks.forEach(block_type => {
                                const item = document.createElement("div");
                                item.classList.add("collapsible-item", "waves-effect");
                                item.innerText = block_type[0];
                                item.addEventListener("click", ev => {
                                    sidenav.close();
                                    const block = new block_type[1]();
                                    led_controller_grid.instance.element.appendChild(block.element);
                                    led_controller_grid.instance.drag_block(block);
                                    ev.stopPropagation();
                                });
                                editor_group.appendChild(item);
                            });
                        });
            });
        }

        /**
         * @param {string} name
         * @param {string} group
         * @param {typeof led_controller_block} type
         */
        static register_block(name, group, type) {
            if (this.#dom_loaded) {
                throw TypeError("All led_controller_block subclasses must be registered before the DOM loads");
            } else if (group === "led-outputs") {
                this.#led_output_blocks.push([ name, type ]);
            } else if (group === "control-inputs") {
                this.#control_input_blocks.push([ name, type ]);
            } else if (group === "processing") {
                this.#processing_blocks.push([ name, type ]);
            } else if (group === "generators") {
                this.#generator_blocks.push([ name, type ]);
            } else if (group === "utilities") {
                this.#utility_blocks.push([ name, type ]);
            } else {
                throw TypeError(`Invalid led_controller_block.group value "${group}"`)
            }
        }
};
