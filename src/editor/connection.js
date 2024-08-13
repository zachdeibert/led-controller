"use strict";

class led_controller_connection {
        static CONTROL_DISTANCE = 100;
        static LOOP_DISTANCE    = 50;
        static WIDTH            = 10;

        /**
         * @type {SVGSVGElement}
         */
        #element;

        /**
         * @type {SVGPathElement}
         */
        #path;

        /**
         * @returns {SVGSVGElement}
         */
        get element() {
            return this.#element;
        }

        /**
         * @type {led_controller_connector}
         */
        origin;

        /**
         * @type {led_controller_connector | MouseEvent}
         */
        target;

        /**
         * @param {led_controller_connector} origin
         * @param {led_controller_connector | MouseEvent} target
         */
        constructor(origin, target) {
            this.#element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.#path    = document.createElementNS("http://www.w3.org/2000/svg", "path");
            this.#element.appendChild(this.#path);
            this.origin = origin;
            this.target = target;
            this.#path.addEventListener("mousedown", ev => {
                if (ev.button === 0) {
                    led_controller_grid.instance.drag_connection(this);
                    ev.stopPropagation();
                }
            });
        }

        remove() {
            this.origin.net.split(this);
            this.#element.remove();
        }

        update() {
            const parent_rect = this.#element.parentElement.getBoundingClientRect();
            const origin_rect = this.origin.element.getBoundingClientRect();
            let x0            = origin_rect.x - parent_rect.x + origin_rect.width / 2;
            let y0            = origin_rect.y - parent_rect.y + origin_rect.height / 2;
            const a0          = this.origin.input ? -1 : 1;
            let x4, y4, a4;
            if (this.target instanceof MouseEvent) {
                x4 = this.target.x - parent_rect.x;
                y4 = this.target.y - parent_rect.y;
                a4 = (x4 - x0) * a0 < led_controller_connection.LOOP_DISTANCE ? a0 : -a0;
            } else {
                const target_rect = this.target.element.getBoundingClientRect();
                x4                = target_rect.x - parent_rect.x + target_rect.width / 2;
                y4                = target_rect.y - parent_rect.y + target_rect.height / 2;
                a4                = this.target.input ? -1 : 1;
            }
            const max_x
                    = Math.max(x0, x4) + led_controller_connection.CONTROL_DISTANCE + led_controller_connection.WIDTH;
            const max_y
                    = Math.max(y0, y4) + led_controller_connection.CONTROL_DISTANCE + led_controller_connection.WIDTH;
            const min_x
                    = Math.min(x0, x4) - led_controller_connection.CONTROL_DISTANCE - led_controller_connection.WIDTH;
            const min_y
                    = Math.min(y0, y4) - led_controller_connection.CONTROL_DISTANCE - led_controller_connection.WIDTH;
            x0 -= min_x;
            y0 -= min_y;
            x4 -= min_x;
            y4 -= min_y;
            let x1, x2, x3;
            if (a0 == a4) {
                x1 = x2 = x3 = a0 * (Math.max(x0 * a0, x4 * a0) + led_controller_connection.CONTROL_DISTANCE);
            } else {
                x1 = x0 + led_controller_connection.CONTROL_DISTANCE * a0;
                x2 = (x0 + x4) / 2;
                x3 = x4 + led_controller_connection.CONTROL_DISTANCE * a4;
            }
            const y1 = y0;
            const y2 = (y0 + y4) / 2;
            const y3 = y4;

            this.#element.style.height = `${max_y - min_y}px`;
            this.#element.style.left   = `${min_x}px`;
            this.#element.style.top    = `${min_y}px`;
            this.#element.style.width  = `${max_x - min_x}px`;
            this.#path.setAttribute("d", `M${x0} ${y0} Q${x1} ${y1} ${x2} ${y2} Q${x3} ${y3} ${x4} ${y4}`);
            this.#element.style.display = "block";
        }
};
