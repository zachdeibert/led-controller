"use strict";

class led_controller_block {
        /**
         * @type {HTMLInputElement | null}
         */
        static #color_field = null;

        static #color_modal;
        static #color_picker;
        static #nonce = 0;

        /**
         * @type {HTMLDivElement}
         */
        #element;

        /**
         * @type {HTMLFormElement}
         */
        #form;

        /**
         * @type {led_controller_connector[]}
         */
        connectors;

        /**
         * @returns {led_controller_block[]}
         */
        get dependents() {
            /**
             * @type {Set<led_controller_block>}
             */
            const dependents = new Set();
            this.connectors.forEach(connector => {
                if (connector.output && connector.net !== null) {
                    connector.net.connections.forEach(connection => {
                        if (connection.origin.input) {
                            dependents.add(connection.origin.block);
                        }
                        if (connection.target.input) {
                            dependents.add(connection.target.block);
                        }
                    });
                }
            });
            return Array(...dependents);
        }

        /**
         * @returns {HTMLDivElement}
         */
        get element() {
            return this.#element;
        }

        static {
            document.addEventListener("DOMContentLoaded", () => {
                const color_modal         = document.getElementById("editor-color-modal");
                const color_modal_content = document.getElementById("editor-color-modal-content");
                const color_modal_ok      = document.getElementById("editor-color-modal-ok");

                this.#color_modal  = M.Modal.init([ color_modal ])[0];
                this.#color_picker = new iro.ColorPicker(color_modal_content);

                color_modal_ok.addEventListener("click", () => {
                    this.#color_field.value = this.#color_picker.color.hexString.toUpperCase();
                    this.#color_field.dispatchEvent(new Event("input"));
                });
            });
        }

        /**
         * @param {string} title
         * @param {number} width
         * @param {number} height
         */
        constructor(title, width, height) {
            this.#element                  = document.createElement("div");
            this.#element.style.height     = `${height}px`;
            this.#element.style.marginLeft = `-${width / 2}px`;
            this.#element.style.width      = `${width}px`;

            const title_div = document.createElement("div");
            title_div.classList.add("block-title");
            title_div.innerText = title;
            this.#element.appendChild(title_div);

            this.#form = document.createElement("div");
            this.#form.classList.add("block-form");
            this.#element.appendChild(this.#form);

            this.connectors = [];

            title_div.addEventListener("mousedown", ev => {
                if (ev.button === 0) {
                    led_controller_grid.instance.drag_block(this);
                    ev.stopPropagation();
                }
            });
            this.#element.addEventListener("mousedown", ev => {
                if (ev.button === 0) {
                    ev.stopPropagation();
                }
            });
        }

        /**
         * @param {string} label_text
         * @param {string} value
         * @param {(value: string) => void} on_change
         * @returns {HTMLInputElement}
         */
        add_color_input(label_text, value, on_change = () => {}) {
            /**
             * @type {HTMLInputElement}
             */
            let input;

            const update_style = v => {
                const background            = v.padEnd(7, "0");
                // http://stackoverflow.com/a/3943023/112731
                let r                       = parseInt(background.substring(1, 3), 16) / 255;
                let g                       = parseInt(background.substring(3, 5), 16) / 255;
                let b                       = parseInt(background.substring(5, 7), 16) / 255;
                r                           = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
                g                           = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
                b                           = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
                const l                     = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                const foreground            = l >= 0.179 ? "#000000" : "#FFFFFF";
                input.style.backgroundColor = background;
                input.style.borderColor     = foreground;
                input.style.color           = foreground;
                on_change(v);
            };

            input                 = this.add_text_input("text",
                                        label_text,
                                        value,
                                        v => "#" + v.toUpperCase().replace(/[^0-9A-F]/g, "").substring(0, 6),
                                        update_style);
            input.style.textAlign = "left";
            update_style(value);

            input.addEventListener("dblclick", () => {
                led_controller_block.#color_field                  = input;
                led_controller_block.#color_picker.color.hexString = input.value.padEnd(7, "0");
                led_controller_block.#color_modal.open();
            });

            return input;
        }

        /**
         * @param {number} y
         * @param {boolean} input
         */
        add_connector(y, input) {
            const connector = new led_controller_connector(this, y, input);
            this.connectors.push(connector);
            this.#element.appendChild(connector.element);
        }

        /**
         * @param {string} off_label
         * @param {string} on_label
         * @param {boolean} value
         * @param {(value: boolean) => void} on_change
         * @returns {HTMLInputElement}
         */
        add_switch(off_label, on_label, value, on_change = () => {}) {
            const div = document.createElement("div");
            div.classList.add("switch");
            this.#form.appendChild(div);

            const label = document.createElement("label");
            div.appendChild(label);

            const off = document.createElement("span");
            off.classList.add("switch-label");
            off.innerText = off_label;
            label.appendChild(off);

            const input   = document.createElement("input");
            input.checked = value;
            input.type    = "checkbox";
            label.appendChild(input);

            const lever = document.createElement("span");
            lever.classList.add("lever");
            label.appendChild(lever);

            const on = document.createElement("span");
            on.classList.add("switch-label");
            on.innerText = on_label;
            label.appendChild(on);

            input.addEventListener("change", () => {
                const value = input.checked;
                led_controller_toolbar.instance.handle_action(
                        () => {
                            input.checked = value;
                            on_change(value);
                        },
                        () => {
                            input.checked = !value;
                            on_change(!value);
                        });
            });

            return input;
        }

        /**
         * @param {string} type
         * @param {string} label_text
         * @param {string} value
         * @param {(value: string) => string} validate
         * @param {(value: string) => void} on_change
         * @returns {HTMLInputElement}
         */
        add_text_input(type, label_text, value, validate = null, on_change = () => {}) {
            const input_field = document.createElement("div");
            input_field.classList.add("input-field", "outlined");
            this.#form.appendChild(input_field);

            const input = document.createElement("input");
            input.id    = `dynamic-block-id-${++led_controller_block.#nonce}`;
            input.type  = type;
            input.value = value;
            input_field.appendChild(input);

            const label     = document.createElement("label");
            label.htmlFor   = input.id;
            label.innerText = label_text;
            input_field.appendChild(label);

            if (validate === null) {
                switch (type) {
                    case "number":
                        validate = v => {
                            v = v.replace(/[^0-9]/g, "");
                            if (v.length == 0) {
                                v = "0";
                            }
                            let i = parseInt(v);
                            if (input.min.length > 0) {
                                let b = parseInt(input.min);
                                if (i < b) {
                                    i = b;
                                }
                            }
                            if (input.max.length > 0) {
                                let b = parseInt(input.max);
                                if (i > b) {
                                    i = b;
                                }
                            }
                            return i.toString();
                        };
                        break;

                    default: validate = v => v; break;
                }
            }

            let prev_value = value;
            input.addEventListener("input", () => {
                const orig_value = input.value;
                const new_value  = validate(orig_value);
                const old_value  = prev_value;
                if (new_value !== old_value) {
                    led_controller_toolbar.instance.handle_action(
                            () => {
                                input.value = new_value;
                                prev_value  = new_value;
                                on_change(new_value);
                            },
                            () => {
                                input.value = old_value;
                                prev_value  = old_value;
                                on_change(old_value);
                            });
                } else if (new_value !== orig_value) {
                    input.value = new_value;
                }
            });

            return input;
        }

        /**
         * @returns {led_controller_block}
         */
        copy() {
            throw TypeError("led_controller_block.copy() is abstract");
        }

        /**
         * @returns {led_controller_connection[]}
         */
        remove() {
            /**
             * @type {led_controller_connection[]}
             */
            const removed_connections = [];
            this.connectors.forEach(connector => {
                if (connector.net !== null) {
                    connector.net.connections.forEach(connection => {
                        if (connection.origin === connector || connection.target === connector) {
                            connection.remove();
                            removed_connections.push(connection);
                        }
                    });
                }
            });
            this.#element.remove();
            led_controller_grid.instance.remove_block(this);
            return removed_connections;
        }

        update() {
            this.connectors.forEach(connector => {
                if (connector.net !== null) {
                    connector.net.connections.forEach(connection => {
                        if (connection.origin === connector || connection.target === connector) {
                            connection.update();
                        }
                    });
                }
            });
        }
}
