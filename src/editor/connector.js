"use strict";

class led_controller_connector {
        /**
         * @type {led_controller_block}
         */
        #block;

        /**
         * @type {HTMLDivElement}
         */
        #element;

        /**
         * @type {boolean}
         */
        #input;

        /**
         * @returns {led_controller_block}
         */
        get block() {
            return this.#block;
        }

        /**
         * @returns {HTMLDivElement}
         */
        get element() {
            return this.#element;
        }

        /**
         * @returns {boolean}
         */
        get input() {
            return this.#input;
        }

        /**
         * @type {led_controller_net | null}
         */
        net;

        /**
         * @returns {boolean}
         */
        get output() {
            return !this.#input;
        }

        /**
         * @param {led_controller_block} block
         * @param {number} y
         * @param {boolean} input
         */
        constructor(block, y, input) {
            this.#element = document.createElement("div");
            this.#element.classList.add("block-connector");
            if (input) {
                this.#element.classList.add("block-connector-input");
            } else {
                this.#element.classList.add("block-connector-output");
            }
            this.#element.style.top = `${y}px`;

            this.#block = block;
            this.#input = input;
            this.net    = null;

            this.#element.addEventListener("mousedown", ev => {
                if (ev.button !== 2) {
                    led_controller_grid.instance.drag_connector(this);
                    ev.stopPropagation();
                }
            });
            this.#element.addEventListener("mousemove", ev => {
                led_controller_grid.instance.hover_connector(this);
                ev.stopPropagation();
            });
        }
};
