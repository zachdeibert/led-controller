"use strict";

class led_controller_block {
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
         * @type {led_controller_connection[]}
         */
        connections;

        /**
         * @returns {HTMLDivElement}
         */
        get element() {
            return this.#element;
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

            this.connections = [];

            title_div.addEventListener("mousedown", ev => {
                if (ev.button !== 2) {
                    led_controller_grid.instance.drag_block(this);
                    ev.stopPropagation();
                }
            });
            this.#element.addEventListener("mousedown", ev => { ev.stopPropagation(); });
        }

        /**
         * @param {string} off_label
         * @param {string} on_label
         * @returns {HTMLInputElement}
         */
        add_switch(off_label, on_label) {
            const div = document.createElement("div");
            div.classList.add("switch");
            this.#form.appendChild(div);

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
            this.#form.appendChild(input_field);

            const input = document.createElement("input");
            input.id    = `dynamic-block-id-${++led_controller_block.#nonce}`;
            input.type  = type;
            input_field.appendChild(input);

            const label     = document.createElement("label");
            label.htmlFor   = input.id;
            label.innerText = label_text;
            input_field.appendChild(label);

            return input;
        }

        update() {
            this.connections.forEach(connection => { connection.update(); });
        }
}
