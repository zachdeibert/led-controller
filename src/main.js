"use strict";

class led_controller_editor {
        static GRID_SIZE_MAJOR = 50;
        static GRID_SIZE_MINOR = 10;

        /**
         * @type {HTMLElement}
         */
        static #editor_content;

        /**
         * @type {HTMLElement | null}
         */
        static #dragging_block = null;

        static {
            document.addEventListener("DOMContentLoaded", () => {
                const editor_container = document.getElementById("editor-container");
                this.#editor_content   = document.getElementById("editor-content");
                const editor_grid      = document.getElementById("editor-grid");
                const editor_offset    = document.getElementById("editor-offset");

                M.Tooltip.init(document.querySelectorAll(".tooltipped"), {});

                {
                    let mouse_down = false;
                    let offset_x   = 0;
                    let offset_y   = 0;
                    /**
                     * @param {MouseEvent} ev
                     */
                    const mouse_up = ev => {
                        if (mouse_down) {
                            mouse_down = false;
                            ev.stopPropagation();
                        } else if (this.#dragging_block !== null) {
                            this.#dragging_block = null;
                            ev.stopPropagation();
                        }
                    };
                    editor_grid.addEventListener("mousedown", ev => {
                        if (ev.button !== 2) {
                            if (this.#dragging_block !== null) {
                                this.#dragging_block = null;
                                ev.stopPropagation();
                            } else if (ev.target === editor_container || ev.target === editor_grid
                                       || ev.target === editor_offset || ev.target === this.#editor_content) {
                                mouse_down = true;
                                ev.stopPropagation();
                            }
                        }
                    });
                    editor_grid.addEventListener("mouseleave", mouse_up);
                    editor_grid.addEventListener("mousemove", ev => {
                        if (mouse_down) {
                            let scroll_x = editor_container.scrollLeft - ev.movementX;
                            let scroll_y = editor_container.scrollTop - ev.movementY;
                            while (scroll_x < 0) {
                                scroll_x += this.GRID_SIZE_MAJOR;
                                offset_x += this.GRID_SIZE_MAJOR;
                            }
                            while (scroll_y < 0) {
                                scroll_y += this.GRID_SIZE_MAJOR;
                                offset_y += this.GRID_SIZE_MAJOR;
                            }
                            const max_x = editor_grid.clientWidth - editor_container.clientWidth;
                            while (scroll_x >= max_x) {
                                scroll_x -= this.GRID_SIZE_MAJOR;
                                offset_x -= this.GRID_SIZE_MAJOR;
                            }
                            const max_y = editor_grid.clientHeight - editor_container.clientHeight;
                            while (scroll_y >= max_y) {
                                scroll_y -= this.GRID_SIZE_MAJOR;
                                offset_y -= this.GRID_SIZE_MAJOR;
                            }
                            editor_container.scrollTo(scroll_x, scroll_y);
                            editor_offset.style.left = `${offset_x}px`;
                            editor_offset.style.top  = `${offset_y}px`;
                            ev.stopPropagation();
                        } else if (this.#dragging_block !== null) {
                            const content                   = this.#editor_content.getBoundingClientRect();
                            this.#dragging_block.style.left = `${
                                    Math.round((ev.x - content.x) / this.GRID_SIZE_MINOR) * this.GRID_SIZE_MINOR}px`;
                            this.#dragging_block.style.top = `${
                                    Math.round((ev.y - content.y) / this.GRID_SIZE_MINOR) * this.GRID_SIZE_MINOR}px`;
                            this.#dragging_block.style.display = "block";
                            ev.stopPropagation();
                        }
                    });
                    editor_grid.addEventListener("mouseup", mouse_up);
                }
            });
        }

        /**
         * @param {led_controller_block} block
         */
        static create_block(block) {
            this.#editor_content.appendChild(block.root_element);
            this.#dragging_block = block.root_element;
            block.root_element.querySelectorAll(".block-title").forEach(element => {
                element.addEventListener("mousedown", ev => {
                    if (ev.button !== 2 && this.#dragging_block === null) {
                        this.#dragging_block = block.root_element;
                        ev.stopPropagation();
                    }
                });
            });
        }
};

class led_controller_block {
        /**
         * @type {(typeof led_controller_block)[]}
         */
        static #led_output_subclasses = [];

        /**
         * @type {(typeof led_controller_block)[]}
         */
        static #control_input_subclasses = [];

        /**
         * @type {(typeof led_controller_block)[]}
         */
        static #processing_subclasses = [];

        /**
         * @type {(typeof led_controller_block)[]}
         */
        static #generator_subclasses = [];

        /**
         * @type {(typeof led_controller_block)[]}
         */
        static #utility_subclasses = [];

        static #dom_loaded = false;

        static #nonce = 0;

        /**
         * @type {HTMLDivElement}
         */
        #root_element;

        /**
         * @type {HTMLFormElement}
         */
        #form_element;

        /**
         * @returns {string}
         */
        static get css_class() {
            throw TypeError("led_controller_block.css_class is abstract");
        }

        /**
         * @returns {string}
         */
        static get group() {
            throw TypeError("led_controller_block.group is abstract");
        }

        /**
         * @returns {string}
         */
        static get name() {
            throw TypeError("led_controller_block.name is abstract");
        }

        /**
         * @returns {string}
         */
        static get title() {
            throw TypeError("led_controller_block.title is abstract");
        }

        /**
         * @returns {HTMLDivElement}
         */
        get root_element() {
            return this.#root_element;
        }

        constructor() {
            this.#root_element = document.createElement("div");
            this.#root_element.classList.add(this.constructor.css_class);

            const title = document.createElement("div");
            title.classList.add("block-title");
            title.innerText = this.constructor.title;
            this.#root_element.appendChild(title);

            this.#form_element = document.createElement("div");
            this.#form_element.classList.add("block-form");
            this.#root_element.appendChild(this.#form_element);
        }

        /**
         * @param {typeof led_controller_block} subclass
         */
        static register(subclass) {
            if (this.#dom_loaded) {
                throw TypeError("All led_controller_block subclasses must be registered before the DOM loads");
            } else if (subclass.group === "led-outputs") {
                this.#led_output_subclasses.push(subclass);
            } else if (subclass.group === "control-inputs") {
                this.#control_input_subclasses.push(subclass);
            } else if (subclass.group === "processing") {
                this.#processing_subclasses.push(subclass);
            } else if (subclass.group === "generators") {
                this.#generator_subclasses.push(subclass);
            } else if (subclass.group === "utilities") {
                this.#utility_subclasses.push(subclass);
            } else {
                throw TypeError(`Invalid led_controller_block.group value "${subclass.group}"`)
            }
        }

        static {
            document.addEventListener("DOMContentLoaded", () => {
                const editor_add_menu             = document.getElementById("editor-add-menu");
                const editor_group_control_inputs = document.getElementById("editor-group-control-inputs");
                const editor_group_generators     = document.getElementById("editor-group-generators");
                const editor_group_led_outputs    = document.getElementById("editor-group-led-outputs");
                const editor_group_processing     = document.getElementById("editor-group-processing");
                const editor_group_utilities      = document.getElementById("editor-group-utilities");

                this.#dom_loaded = true;
                const sidenav    = M.Sidenav.init([ editor_add_menu ], { "edge" : "right" })[0];
                M.Collapsible.init([ editor_add_menu ], { "accordion" : false });

                [[ this.#led_output_subclasses, editor_group_led_outputs ],
                 [ this.#control_input_subclasses, editor_group_control_inputs ],
                 [ this.#processing_subclasses, editor_group_processing ],
                 [ this.#generator_subclasses, editor_group_generators ],
                 [ this.#utility_subclasses, editor_group_utilities ]]
                        .forEach(args => {
                            /**
                             * @type {(typeof led_controller_block)[]}
                             */
                            const subclasses   = args[0];
                            /**
                             * @type {HTMLElement}
                             */
                            const editor_group = args[1];

                            subclasses.forEach(subclass => {
                                const item = document.createElement("div");
                                item.classList.add("collapsible-item", "waves-effect");
                                item.innerText = subclass.name;
                                item.addEventListener("click", ev => {
                                    sidenav.close();
                                    led_controller_editor.create_block(new subclass());
                                    ev.stopPropagation();
                                });
                                editor_group.appendChild(item);
                            });
                        });
            });
        }

        /**
         * @param {string} off_label
         * @param {string} on_label
         * @returns {HTMLInputElement}
         */
        add_switch(off_label, on_label) {
            const div = document.createElement("div");
            div.classList.add("switch");
            this.#form_element.appendChild(div);

            const label = document.createElement("label");
            div.appendChild(label);

            const off = document.createElement("span");
            off.classList.add("switch-label");
            off.innerText = off_label;
            label.appendChild(off);

            const input = document.createElement("input");
            input.type  = "checkbox";
            label.appendChild(input);

            const lever = document.createElement("span");
            lever.classList.add("lever");
            label.appendChild(lever);

            const on = document.createElement("span");
            on.classList.add("switch-label");
            on.innerText = on_label;
            label.appendChild(on);

            return input;
        }

        /**
         * @param {string} type
         * @param {string} label_text
         * @returns {HTMLInputElement}
         */
        add_text_input(type, label_text) {
            const input_field = document.createElement("div");
            input_field.classList.add("input-field", "outlined");
            this.#form_element.appendChild(input_field);

            const input = document.createElement("input");
            input.id    = `dynamic-id-${++led_controller_block.#nonce}`;
            input.type  = type;
            input_field.appendChild(input);

            const label     = document.createElement("label");
            label.htmlFor   = input.id;
            label.innerText = label_text;
            input_field.appendChild(label);

            return input;
        }
}
