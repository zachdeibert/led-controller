"use strict";

class led_controller_grid {
        static #DRAG_NONE       = 0;
        static #DRAG_BLOCK      = 1;
        static #DRAG_CONNECTION = 2;
        static #DRAG_GRID       = 3;

        static MAJOR = 50;
        static MINOR = 10;

        /**
         * @type {led_controller_grid}
         */
        static instance;

        /**
         * @type {led_controller_block[]}
         */
        #blocks;

        /**
         * @type {HTMLDivElement}
         */
        #container;

        /**
         * @type {led_controller_block | led_controller_connection | null}
         */
        #drag_object;

        /**
         * @type {number}
         */
        #drag_state;

        /**
         * @type {HTMLDivElement}
         */
        #element;

        /**
         * @type {HTMLDivElement}
         */
        #grid;

        /**
         * @type {HTMLDivElement}
         */
        #offset;

        /**
         * @type {number}
         */
        #offset_x;

        /**
         * @type {number}
         */
        #offset_y;

        /**
         * @type {led_controller_block | led_controller_connection | null}
         */
        #selection;

        /**
         * @returns {HTMLDivElement}
         */
        get element() {
            return this.#element;
        }

        static {
            document.addEventListener("DOMContentLoaded", () => { this.instance = new led_controller_grid(); });
        }

        constructor() {
            this.#container = document.getElementById("editor-container");
            this.#element   = document.getElementById("editor-content");
            this.#grid      = document.getElementById("editor-grid");
            this.#offset    = document.getElementById("editor-offset");

            this.#blocks      = [];
            this.#drag_object = null;
            this.#drag_state  = led_controller_grid.#DRAG_NONE;
            this.#offset_x    = 0;
            this.#offset_y    = 0;
            this.#selection   = null;

            window.addEventListener("keydown", ev => this.#key_down(ev));
            this.#grid.addEventListener("mousedown", ev => this.#mouse_down(ev));
            this.#grid.addEventListener("mouseleave", ev => this.#mouse_up(ev));
            this.#grid.addEventListener("mousemove", ev => this.#mouse_move(ev));
            this.#grid.addEventListener("mouseup", ev => this.#mouse_up(ev));
        }

        /**
         * @param {led_controller_block} block
         */
        add_block(block) {
            this.#blocks.push(block);
            this.#element.appendChild(block.element);
            this.drag_block(block);
        }

        /**
         * @param {led_controller_block} block
         */
        drag_block(block) {
            if (this.#selection !== null) {
                this.#selection.element.classList.remove("selected");
            }
            block.element.classList.add("selected");
            this.#selection   = block;
            this.#drag_object = block;
            this.#drag_state  = led_controller_grid.#DRAG_BLOCK;
        }

        /**
         * @param {led_controller_connection} connection
         */
        drag_connection(connection) {
            if (this.#selection !== null) {
                this.#selection.element.classList.remove("selected");
            }
            connection.element.classList.add("selected");
            this.#selection = connection;
        }

        /**
         * @param {led_controller_connector} connector
         */
        drag_connector(connector) {
            if (this.#selection !== null) {
                this.#selection.element.classList.remove("selected");
                this.#selection = null;
            }
            this.#drag_object = new led_controller_connection(connector, connector);
            this.#drag_object.element.classList.add("invalid");
            this.#drag_state = led_controller_grid.#DRAG_CONNECTION;
            this.#element.appendChild(this.#drag_object.element);
        }

        /**
         * @param {led_controller_connector} connector
         */
        hover_connector(connector) {
            if (this.#drag_state === led_controller_grid.#DRAG_CONNECTION && this.#drag_object.target !== connector) {
                this.#drag_object.target = connector;
                /**
                 * @type {led_controller_connector}
                 */
                const origin             = this.#drag_object.origin;
                /**
                 * @type {led_controller_connector}
                 */
                const target             = this.#drag_object.target;
                if (origin.net === target.net && origin.net !== null) {
                    // Can't connect a loop of connections within a single net
                    this.#drag_object.element.classList.add("invalid");
                } else if (origin == target) {
                    // Can't connect a connector to itself
                    this.#drag_object.element.classList.add("invalid");
                } else if (this.#count_drivers(this.#drag_object) > 1) {
                    // Can't connect two outputs to a single net
                    this.#drag_object.element.classList.add("invalid");
                } else if (!led_controller_net.remains_dag(this.#blocks, this.#drag_object)) {
                    // Can't create a cycle of blocks
                    this.#drag_object.element.classList.add("invalid");
                } else {
                    this.#drag_object.element.classList.remove("invalid");
                }
                this.#drag_object.update();
            }
        }

        /**
         * @param {led_controller_connection} connection
         * @returns {number}
         */
        #count_drivers(connection) {
            let drivers = 0;
            if (connection.origin.net !== null) {
                if (connection.origin.net.driver !== null) {
                    ++drivers;
                }
            } else if (connection.origin.output) {
                ++drivers;
            }
            if (connection.target.net !== null) {
                if (connection.target.net.driver !== null) {
                    ++drivers;
                }
            } else if (connection.target.output) {
                ++drivers;
            }
            return drivers;
        }

        /**
         * @param {KeyboardEvent} ev
         */
        #key_down(ev) {
            switch (ev.code) {
                case "Escape":
                    if (this.#selection !== null) {
                        this.#selection.element.classList.remove("selected");
                        this.#selection = null;
                    }
                    ev.stopPropagation();
                    break;
            }
        }

        /**
         * @param {MouseEvent} ev
         */
        #mouse_down(ev) {
            if (ev.button !== 2) {
                if (this.#drag_state !== led_controller_grid.#DRAG_NONE) {
                    this.#mouse_up(ev);
                } else {
                    if (this.#selection !== null) {
                        this.#selection.element.classList.remove("selected");
                        this.#selection = null;
                    }
                    this.#drag_state = led_controller_grid.#DRAG_GRID;
                }
                ev.stopPropagation();
            }
        }

        /**
         * @param {MouseEvent} ev
         */
        #mouse_move(ev) {
            switch (this.#drag_state) {
                case led_controller_grid.#DRAG_NONE: return;

                case led_controller_grid.#DRAG_BLOCK:
                    const content = this.#element.getBoundingClientRect();
                    let x         = ev.x - content.x;
                    let y         = ev.y - content.y;
                    x             = Math.round(x / led_controller_grid.MINOR) * led_controller_grid.MINOR;
                    y             = Math.round(y / led_controller_grid.MINOR) * led_controller_grid.MINOR;
                    this.#drag_object.element.style.left    = `${x}px`;
                    this.#drag_object.element.style.top     = `${y}px`;
                    this.#drag_object.element.style.display = "block";
                    this.#drag_object.update();
                    break;

                case led_controller_grid.#DRAG_CONNECTION:
                    this.#drag_object.element.classList.remove("invalid");
                    this.#drag_object.target = ev;
                    this.#drag_object.update();
                    break;

                case led_controller_grid.#DRAG_GRID:
                    let scroll_x = this.#container.scrollLeft - ev.movementX;
                    let scroll_y = this.#container.scrollTop - ev.movementY;
                    while (scroll_x < 0) {
                        scroll_x       += led_controller_grid.MAJOR;
                        this.#offset_x += led_controller_grid.MAJOR;
                    }
                    while (scroll_y < 0) {
                        scroll_y       += led_controller_grid.MAJOR;
                        this.#offset_y += led_controller_grid.MAJOR;
                    }
                    const max_x = this.#grid.clientWidth - this.#container.clientWidth;
                    while (scroll_x >= max_x) {
                        scroll_x       -= led_controller_grid.MAJOR;
                        this.#offset_x -= led_controller_grid.MAJOR;
                    }
                    const max_y = this.#grid.clientHeight - this.#container.clientHeight;
                    while (scroll_y >= max_y) {
                        scroll_y       -= led_controller_grid.MAJOR;
                        this.#offset_y -= led_controller_grid.MAJOR;
                    }
                    this.#container.scrollTo(scroll_x, scroll_y);
                    this.#offset.style.left = `${this.#offset_x}px`;
                    this.#offset.style.top  = `${this.#offset_y}px`;
                    break;
            }
            ev.stopPropagation();
        }

        /**
         * @param {MouseEvent} ev
         */
        #mouse_up(ev) {
            switch (this.#drag_state) {
                case led_controller_grid.#DRAG_NONE: return;

                case led_controller_grid.#DRAG_BLOCK: break;

                case led_controller_grid.#DRAG_CONNECTION:
                    if ((this.#drag_object.target instanceof MouseEvent)
                        || this.#drag_object.element.classList.contains("invalid")) {
                        this.#drag_object.element.remove();
                    } else {
                        const net
                                = led_controller_net.merge(this.#drag_object.origin.net, this.#drag_object.target.net);
                        net.connections.push(this.#drag_object);
                        this.#drag_object.origin.net = net;
                        this.#drag_object.target.net = net;
                    }
                    break;

                case led_controller_grid.#DRAG_GRID: break;
            }
            this.#drag_object = null;
            this.#drag_state  = led_controller_grid.#DRAG_NONE;
            ev.stopPropagation();
        }
};
