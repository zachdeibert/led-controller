"use strict";

class led_controller_editor {
        static GRID_SIZE_MAJOR = 50;
        static GRID_SIZE_MINOR = 10;

        /**
         * @type {led_controller_block[]}
         */
        static #blocks = [];

        /**
         * @type {led_controller_block | null}
         */
        static #dragging_block = null;

        /**
         * @type {HTMLElement}
         */
        static #editor_content;

        static {
            document.addEventListener("DOMContentLoaded", () => {
                const editor_container = document.getElementById("editor-container");
                this.#editor_content   = document.getElementById("editor-content");
                const editor_grid      = document.getElementById("editor-grid");
                const editor_offset    = document.getElementById("editor-offset");

                M.Tooltip.init(document.querySelectorAll(".tooltipped"), {});

                {
                    /**
                     * @type {SVGSVGElement | null}
                     */
                    let drag_arrow = null;
                    /**
                     * @type {HTMLElement | null}
                     */
                    let drag_from  = null;
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
                        } else if (drag_arrow !== null) {
                            if (ev.target.classList.contains("block-connector") && drag_from !== ev.target) {
                                const connection = [ drag_from, ev.target, drag_arrow ];
                                this.#blocks[drag_from.parentElement.dataset.editorBlockId].connections.push(connection);
                                this.#blocks[ev.target.parentElement.dataset.editorBlockId].connections.push(connection);
                            } else {
                                drag_arrow.remove();
                            }
                            drag_arrow = null;
                            ev.stopPropagation();
                        }
                    };
                    /**
                     * @param {MouseEvent} ev
                     */
                    const update_arrow = ev => {
                        if (drag_arrow !== null) {
                            drag_arrow.remove();
                        }
                        drag_arrow = this.#draw_arrow(drag_from,
                                                      ev.target.classList.contains("block-connector") ? ev.target : ev);
                    };
                    editor_grid.addEventListener("mousedown", ev => {
                        if (ev.button !== 2) {
                            if (this.#dragging_block !== null) {
                                this.#dragging_block = null;
                                ev.stopPropagation();
                            } else if (ev.target === editor_container || ev.target === editor_grid
                                       || ev.target === editor_offset || ev.target === this.#editor_content
                                       || ev.target.tagName == "svg") {
                                mouse_down = true;
                                ev.stopPropagation();
                            } else if (ev.target.classList.contains("block-connector")) {
                                drag_from = ev.target;
                                update_arrow(ev);
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
                            const content                                = this.#editor_content.getBoundingClientRect();
                            this.#dragging_block.root_element.style.left = `${
                                    Math.round((ev.x - content.x) / this.GRID_SIZE_MINOR) * this.GRID_SIZE_MINOR}px`;
                            this.#dragging_block.root_element.style.top = `${
                                    Math.round((ev.y - content.y) / this.GRID_SIZE_MINOR) * this.GRID_SIZE_MINOR}px`;
                            this.#dragging_block.root_element.style.display = "block";
                            this.#dragging_block.connections.forEach(connection => {
                                connection[2].remove();
                                connection[2] = this.#draw_arrow(connection[0], connection[1]);
                            });
                            ev.stopPropagation();
                        } else if (drag_arrow !== null) {
                            update_arrow(ev);
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
            block.root_element.dataset.editorBlockId = this.#blocks.length;
            this.#blocks.push(block);
            this.#dragging_block = block;
            this.#editor_content.appendChild(block.root_element);
            block.root_element.querySelectorAll(".block-title").forEach(element => {
                element.addEventListener("mousedown", ev => {
                    if (ev.button !== 2 && this.#dragging_block === null) {
                        this.#dragging_block = block;
                        ev.stopPropagation();
                    }
                });
            });
        }

        /**
         * @param {HTMLElement} from
         * @param {HTMLElement | MouseEvent} to
         * @returns {SVGSVGElement}
         */
        static #draw_arrow(from, to) {
            const ARROW_WIDTH      = 10;
            const CONTROL_DISTANCE = this.GRID_SIZE_MAJOR * 2;

            let x0, y0, a0, x1, y1, x2, y2, x3, y3, x4, y4, a4, max_x, max_y, min_x, min_y;
            const content_rect = this.#editor_content.getBoundingClientRect();
            const from_rect    = from.getBoundingClientRect();
            x0                 = from_rect.x - content_rect.x + from_rect.width / 2;
            y0                 = from_rect.y - content_rect.y + from_rect.height / 2;
            a0                 = from.classList.contains("block-connector-input") ? -1 : 1;
            if (to instanceof MouseEvent) {
                x4 = to.x - content_rect.x;
                y4 = to.y - content_rect.y;
                a4 = (x4 - x0) * a0 < this.GRID_SIZE_MAJOR ? a0 : -a0;
            } else {
                const to_rect = to.getBoundingClientRect();
                x4            = to_rect.x - content_rect.x + to_rect.width / 2;
                y4            = to_rect.y - content_rect.y + to_rect.height / 2;
                a4            = to.classList.contains("block-connector-input") ? -1 : 1;
            }
            max_x  = Math.max(x0, x4) + CONTROL_DISTANCE + ARROW_WIDTH;
            max_y  = Math.max(y0, y4) + CONTROL_DISTANCE + ARROW_WIDTH;
            min_x  = Math.min(x0, x4) - CONTROL_DISTANCE - ARROW_WIDTH;
            min_y  = Math.min(y0, y4) - CONTROL_DISTANCE - ARROW_WIDTH;
            x0    -= min_x;
            y0    -= min_y;
            x4    -= min_x;
            y4    -= min_y;
            if (a0 == a4) {
                x1 = x2 = x3 = a0 * (Math.max(x0 * a0, x4 * a0) + CONTROL_DISTANCE);
            } else {
                x1 = x0 + CONTROL_DISTANCE * a0;
                x2 = (x0 + x4) / 2;
                x3 = x4 + CONTROL_DISTANCE * a4;
            }
            y1 = y0;
            y2 = (y0 + y4) / 2;
            y3 = y4;

            const svg        = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.style.height = `${max_y - min_y}px`;
            svg.style.left   = `${min_x}px`;
            svg.style.top    = `${min_y}px`;
            svg.style.width  = `${max_x - min_x}px`;

            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", `M${x0} ${y0} Q${x1} ${y1} ${x2} ${y2} Q${x3} ${y3} ${x4} ${y4}`);
            svg.appendChild(path);

            this.#editor_content.appendChild(svg);
            return svg;
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
         * @type {[HTMLElement, HTMLElement, SVGSVGElement][]}
         */
        connections;

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

            this.connections = [];
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
         * @param {string} class_name
         * @param {boolean} input
         */
        add_connector(class_name, input) {
            const div = document.createElement("div");
            div.classList.add("block-connector", class_name);
            if (input) {
                div.classList.add("block-connector-input");
            } else {
                div.classList.add("block-connector-output");
            }
            this.#root_element.appendChild(div);
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
