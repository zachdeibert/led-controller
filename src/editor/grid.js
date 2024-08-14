"use strict";

class led_controller_grid {
        static #DRAG_NONE       = 0;
        static #DRAG_BLOCK      = 1;
        static #DRAG_CONNECTION = 2;
        static #DRAG_GRID       = 3;
        static #DRAG_NEW_BLOCK  = 4;

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
         * @type {led_controller_block | null}
         */
        #clipboard;

        /**
         * @type {HTMLDivElement}
         */
        #container;

        /**
         * @type {led_controller_block | led_controller_connection | null}
         */
        #drag_object;

        /**
         * @type {[string, string]}
         */
        #drag_start;

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
            this.#clipboard   = null;
            this.#drag_object = null;
            this.#drag_start  = [ "", "" ];
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
            this.#add_block(block);
            this.drag_block(block);
            this.#drag_state = led_controller_grid.#DRAG_NEW_BLOCK;
        }

        /**
         * @param {led_controller_block} block
         */
        remove_block(block) {
            this.#blocks.splice(this.#blocks.indexOf(block), 1);
        }

        deselect() {
            if (this.#selection !== null) {
                this.#selection.element.classList.remove("selected");
                this.#selection = null;
            }
        }

        /**
         * @param {led_controller_block} block
         */
        drag_block(block) {
            if (this.#drag_state !== led_controller_grid.#DRAG_NEW_BLOCK) {
                this.deselect();
                block.element.classList.add("selected");
                this.#selection   = block;
                this.#drag_object = block;
                this.#drag_start  = [ block.element.style.left, block.element.style.top ];
                this.#drag_state  = led_controller_grid.#DRAG_BLOCK;
            }
        }

        /**
         * @param {led_controller_connection} connection
         */
        drag_connection(connection) {
            this.deselect();
            connection.element.classList.add("selected");
            this.#selection = connection;
        }

        /**
         * @param {led_controller_connector} connector
         */
        drag_connector(connector) {
            this.deselect();
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
         * @param {led_controller_block} block
         */
        #add_block(block) {
            this.#blocks.push(block);
            this.#element.appendChild(block.element);
        }

        /**
         * @param {led_controller_connection} connection
         */
        #add_connection(connection) {
            const net = led_controller_net.merge(connection.origin.net, connection.target.net);
            net.connections.push(connection);
            connection.origin.net = net;
            connection.target.net = net;
            if (connection.element.parentElement === null) {
                this.#element.appendChild(connection.element);
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
                case "Backspace":
                case "Delete":
                    const selection = this.#selection;
                    if (selection !== null) {
                        this.deselect();
                        const connections = [];
                        led_controller_toolbar.instance.handle_action(
                                () => {
                                    if (selection instanceof led_controller_block) {
                                        connections.push(...selection.remove());
                                    } else {
                                        selection.remove();
                                    }
                                },
                                () => {
                                    if (selection instanceof led_controller_block) {
                                        this.#add_block(selection);
                                        while (connections.length > 0) {
                                            this.#add_connection(connections.pop());
                                        }
                                    } else {
                                        this.#add_connection(selection);
                                    }
                                });
                    }
                    ev.stopPropagation();
                    break;

                case "Escape":
                    switch (this.#drag_state) {
                        case led_controller_grid.#DRAG_NONE: this.deselect(); break;

                        case led_controller_grid.#DRAG_BLOCK:
                            this.#drag_object.element.style.left = this.#drag_start[0];
                            this.#drag_object.element.style.top  = this.#drag_start[1];
                            this.#drag_object                    = null;
                            this.#drag_state                     = led_controller_grid.#DRAG_NONE;
                            break;

                        case led_controller_grid.#DRAG_CONNECTION:
                        case led_controller_grid.#DRAG_GRID      : this.#mouse_up(ev); break;

                        case led_controller_grid.#DRAG_NEW_BLOCK:
                            this.deselect();
                            this.#drag_object.remove();
                            this.#drag_object = null;
                            this.#drag_state  = led_controller_grid.#DRAG_NONE;
                            break;
                    }
                    ev.stopPropagation();
                    break;

                case "KeyC":
                    if (ev.ctrlKey && !ev.altKey && !ev.shiftKey) {
                        if (this.#selection !== null && this.#selection instanceof led_controller_block) {
                            this.#clipboard = this.#selection.copy();
                        }
                        ev.stopPropagation();
                    }
                    break;

                case "KeyV":
                    if (ev.ctrlKey && !ev.altKey && !ev.shiftKey) {
                        if (this.#clipboard !== null) {
                            this.add_block(this.#clipboard.copy());
                        }
                        ev.stopPropagation();
                    }
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
                    this.deselect();
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
                case led_controller_grid.#DRAG_NEW_BLOCK:
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
         * @param {Event} ev
         */
        #mouse_up(ev) {
            switch (this.#drag_state) {
                case led_controller_grid.#DRAG_NONE: return;

                case led_controller_grid.#DRAG_BLOCK:
                case led_controller_grid.#DRAG_NEW_BLOCK:
                    /**
                     * @type {led_controller_block}
                     */
                    const block = this.#drag_object;
                    const redo  = [ block.element.style.left, block.element.style.top ];
                    const undo  = this.#drag_start;
                    if (this.#drag_state == led_controller_grid.#DRAG_BLOCK) {
                        if (redo[0] !== undo[0] || redo[1] !== undo[1]) {
                            led_controller_toolbar.instance.handle_action(
                                    () => {
                                        block.element.style.left = redo[0];
                                        block.element.style.top  = redo[1];
                                        block.update();
                                    },
                                    () => {
                                        block.element.style.left = undo[0];
                                        block.element.style.top  = undo[1];
                                        block.update();
                                    });
                        }
                    } else {
                        led_controller_toolbar.instance.handle_action(
                                () => {
                                    if (block.element.parentElement === null) {
                                        this.#add_block(block);
                                    }
                                },
                                () => { block.remove(); });
                    }
                    break;

                case led_controller_grid.#DRAG_CONNECTION:
                    if ((this.#drag_object.target instanceof MouseEvent)
                        || this.#drag_object.element.classList.contains("invalid")) {
                        this.#drag_object.element.remove();
                    } else {
                        /**
                         * @type {led_controller_connection}
                         */
                        const connection = this.#drag_object;
                        led_controller_toolbar.instance.handle_action(() => { this.#add_connection(connection); },
                                                                      () => { connection.remove(); });
                    }
                    break;

                case led_controller_grid.#DRAG_GRID: break;
            }
            this.#drag_object = null;
            this.#drag_state  = led_controller_grid.#DRAG_NONE;
            ev.stopPropagation();
        }
};
