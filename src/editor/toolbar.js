"use strict";

class led_controller_toolbar {
        static UNDO_MAX = 100;

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

        /**
         * @type {led_controller_toolbar | null}
         */
        static instance = null;

        /**
         * @type {[() => void, () => void][]}
         */
        #redo_stack;

        /**
         * @type {[() => void, () => void][]}
         */
        #undo_stack;

        static {
            document.addEventListener("DOMContentLoaded", () => { this.instance = new led_controller_toolbar(); });
        }

        constructor() {
            const editor_add_menu             = document.getElementById("editor-add-menu");
            const editor_group_control_inputs = document.getElementById("editor-group-control-inputs");
            const editor_group_generators     = document.getElementById("editor-group-generators");
            const editor_group_led_outputs    = document.getElementById("editor-group-led-outputs");
            const editor_group_processing     = document.getElementById("editor-group-processing");
            const editor_group_utilities      = document.getElementById("editor-group-utilities");
            const editor_toolbar_redo         = document.getElementById("editor-toolbar-redo");
            const editor_toolbar_undo         = document.getElementById("editor-toolbar-undo");

            this.#redo_stack = [];
            this.#undo_stack = [];

            M.Collapsible.init([ editor_add_menu ], { "accordion" : false });
            const sidenav = M.Sidenav.init([ editor_add_menu ], { "edge" : "right" })[0];
            M.Tooltip.init(document.querySelectorAll(".tooltipped"), {});

            [[ led_controller_toolbar.#led_output_blocks, editor_group_led_outputs ],
             [ led_controller_toolbar.#control_input_blocks, editor_group_control_inputs ],
             [ led_controller_toolbar.#processing_blocks, editor_group_processing ],
             [ led_controller_toolbar.#generator_blocks, editor_group_generators ],
             [ led_controller_toolbar.#utility_blocks, editor_group_utilities ]]
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
                                led_controller_grid.instance.add_block(new block_type[1]());
                                ev.stopPropagation();
                            });
                            editor_group.appendChild(item);
                        });
                    });

            window.addEventListener("keydown", ev => this.#key_down(ev));
            editor_toolbar_redo.addEventListener("click", () => this.#redo());
            editor_toolbar_undo.addEventListener("click", () => this.#undo());
        }

        /**
         * @param {string} name
         * @param {string} group
         * @param {typeof led_controller_block} type
         */
        static register_block(name, group, type) {
            if (led_controller_toolbar.instance !== null) {
                throw new TypeError("All led_controller_block subclasses must be registered before the DOM loads");
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
                throw new TypeError(`Invalid led_controller_block.group value "${group}"`)
            }
        }

        /**
         * @param {() => void} redo_action
         * @param {() => void} undo_action
         */
        handle_action(redo_action, undo_action) {
            this.#redo_stack = [];
            this.#undo_stack.push([ redo_action, undo_action ]);
            if (this.#undo_stack.length > led_controller_toolbar.UNDO_MAX) {
                this.#undo_stack.splice(0, 1);
            }
            redo_action();
        }

        /**
         * @param {KeyboardEvent} ev
         */
        #key_down(ev) {
            switch (ev.code) {
                case "KeyY":
                    if (ev.ctrlKey && !ev.altKey && !ev.shiftKey) {
                        this.#redo();
                        ev.stopPropagation();
                    }
                    break;

                case "KeyZ":
                    if (ev.ctrlKey && !ev.altKey && !ev.shiftKey) {
                        this.#undo();
                        ev.stopPropagation();
                    }
                    break;
            }
        }

        #undo() {
            const action = this.#undo_stack.pop();
            if (action !== undefined) {
                action[1]();
                this.#redo_stack.push(action);
            }
        }

        #redo() {
            const action = this.#redo_stack.pop();
            if (action !== undefined) {
                action[0]();
                this.#undo_stack.push(action);
            }
        }
};
