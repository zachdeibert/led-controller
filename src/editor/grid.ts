import block from "./block";
import connection from "./connection";
import connector from "./connector";
import net from "./net";
import toolbar from "./toolbar";

enum drag_state {
    BLOCK,
    CONNECTION,
    GRID,
    NEW_BLOCK,
    NONE,
}

export default class grid {
    static MAJOR = 50;
    static MINOR = 10;

    static instance: grid;

    #blocks: block[];
    #clipboard: block | null;
    #container: HTMLDivElement;
    #drag_object: block | connection | null;
    #drag_start: [string, string];
    #drag_state: drag_state;
    #grid: HTMLDivElement;
    #offset: HTMLDivElement;
    #offset_x: number;
    #offset_y: number;
    #selection: block | connection | null;

    readonly element: HTMLDivElement;

    static {
        document.addEventListener("DOMContentLoaded", () => {
            this.instance = new grid();
        });
    }

    constructor() {
        this.#container = document.getElementById("editor-container") as HTMLDivElement;
        this.element = document.getElementById("editor-content") as HTMLDivElement;
        this.#grid = document.getElementById("editor-grid") as HTMLDivElement;
        this.#offset = document.getElementById("editor-offset") as HTMLDivElement;

        this.#blocks = [];
        this.#clipboard = null;
        this.#drag_object = null;
        this.#drag_start = ["", ""];
        this.#drag_state = drag_state.NONE;
        this.#offset_x = 0;
        this.#offset_y = 0;
        this.#selection = null;

        window.addEventListener("keydown", ev => {
            this.#key_down(ev);
        });
        this.#grid.addEventListener("mousedown", ev => {
            this.#mouse_down(ev);
        });
        this.#grid.addEventListener("mouseleave", ev => {
            this.#mouse_up(ev);
        });
        this.#grid.addEventListener("mousemove", ev => {
            this.#mouse_move(ev);
        });
        this.#grid.addEventListener("mouseup", ev => {
            this.#mouse_up(ev);
        });
    }

    add_block(blk: block) {
        this.#add_block(blk);
        this.drag_block(blk);
        this.#drag_state = drag_state.NEW_BLOCK;
    }

    remove_block(blk: block) {
        this.#blocks.splice(this.#blocks.indexOf(blk), 1);
    }

    deselect() {
        if (this.#selection !== null) {
            this.#selection.element.classList.remove("selected");
            this.#selection = null;
        }
    }

    drag_block(blk: block) {
        if (this.#drag_state !== drag_state.NEW_BLOCK) {
            this.deselect();
            blk.element.classList.add("selected");
            this.#selection = blk;
            this.#drag_object = blk;
            this.#drag_start = [blk.element.style.left, blk.element.style.top];
            this.#drag_state = drag_state.BLOCK;
        }
    }

    drag_connection(conn: connection) {
        this.deselect();
        conn.element.classList.add("selected");
        this.#selection = conn;
    }

    drag_connector(conn: connector) {
        this.deselect();
        this.#drag_object = new connection(conn, conn);
        this.#drag_object.element.classList.add("invalid");
        this.#drag_state = drag_state.CONNECTION;
        this.element.appendChild(this.#drag_object.element);
    }

    hover_connector(conn: connector) {
        if (this.#drag_state === drag_state.CONNECTION && (this.#drag_object as connection).target !== conn) {
            (this.#drag_object as connection).target = conn;
            const origin = (this.#drag_object as connection).origin;
            const target = (this.#drag_object as connection).target as connector;
            if (origin.net === target.net && origin.net !== null) {
                // Can't connect a loop of connections within a single net
                this.#drag_object!.element.classList.add("invalid");
            } else if (origin === target) {
                // Can't connect a connector to itself
                this.#drag_object!.element.classList.add("invalid");
            } else if (this.#count_drivers(this.#drag_object as connection) > 1) {
                // Can't connect two outputs to a single net
                this.#drag_object!.element.classList.add("invalid");
            } else if (!net.remains_dag(this.#blocks, this.#drag_object as connection)) {
                // Can't create a cycle of blocks
                this.#drag_object!.element.classList.add("invalid");
            } else {
                this.#drag_object!.element.classList.remove("invalid");
            }
            this.#drag_object!.update();
        }
    }

    #add_block(blk: block) {
        this.#blocks.push(blk);
        this.element.appendChild(blk.element);
    }

    #add_connection(conn: connection) {
        const n = net.merge(conn.origin.net, (conn.target as connector).net);
        n.connections.push(conn);
        conn.origin.net = n;
        (conn.target as connector).net = n;
        if (conn.element.parentElement === null) {
            this.element.appendChild(conn.element);
        }
    }

    #count_drivers(conn: connection): number {
        let drivers = 0;
        if (conn.origin.net !== null) {
            if (conn.origin.net.driver !== null) {
                ++drivers;
            }
        } else if (conn.origin.output) {
            ++drivers;
        }
        if ((conn.target as connector).net !== null) {
            if ((conn.target as connector).net!.driver !== null) {
                ++drivers;
            }
        } else if ((conn.target as connector).output) {
            ++drivers;
        }
        return drivers;
    }

    #key_down(ev: KeyboardEvent) {
        switch (ev.code) {
            case "Backspace":
            case "Delete":
                {
                    const selection = this.#selection;
                    if (selection !== null) {
                        this.deselect();
                        const connections: connection[] = [];
                        toolbar.instance.handle_action(() => {
                            if (selection instanceof block) {
                                connections.push(...selection.remove());
                            } else {
                                selection.remove();
                            }
                        }, () => {
                            if (selection instanceof block) {
                                this.#add_block(selection);
                                while (connections.length > 0) {
                                    this.#add_connection(connections.pop()!);
                                }
                            } else {
                                this.#add_connection(selection);
                            }
                        });
                    }
                    ev.stopPropagation();
                }
                break;

            case "Escape":
                switch (this.#drag_state) {
                    case drag_state.BLOCK:
                        this.#drag_object!.element.style.left = this.#drag_start[0];
                        this.#drag_object!.element.style.top = this.#drag_start[1];
                        this.#drag_object = null;
                        this.#drag_state = drag_state.NONE;
                        break;

                    case drag_state.CONNECTION:
                    case drag_state.GRID:
                        this.#mouse_up(ev);
                        break;

                    case drag_state.NEW_BLOCK:
                        this.deselect();
                        this.#drag_object!.remove();
                        this.#drag_object = null;
                        this.#drag_state = drag_state.NONE;
                        break;

                    case drag_state.NONE:
                        this.deselect();
                        break;
                }
                ev.stopPropagation();
                break;

            case "KeyC":
                if (ev.ctrlKey && !ev.altKey && !ev.shiftKey) {
                    if (this.#selection !== null && this.#selection instanceof block) {
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

    #mouse_down(ev: MouseEvent) {
        if (ev.button !== 2) {
            if (this.#drag_state !== drag_state.NONE) {
                this.#mouse_up(ev);
            } else {
                this.deselect();
                this.#drag_state = drag_state.GRID;
            }
            ev.stopPropagation();
        }
    }

    #mouse_move(ev: MouseEvent) {
        switch (this.#drag_state) {
            case drag_state.BLOCK:
            case drag_state.NEW_BLOCK:
                {
                    const content = this.element.getBoundingClientRect();
                    let x = ev.x - content.x;
                    let y = ev.y - content.y;
                    x = Math.round(x / grid.MINOR) * grid.MINOR;
                    y = Math.round(y / grid.MINOR) * grid.MINOR;
                    this.#drag_object!.element.style.left = `${x}px`;
                    this.#drag_object!.element.style.top = `${y}px`;
                    this.#drag_object!.element.style.display = "block";
                    this.#drag_object!.update();
                }
                break;

            case drag_state.CONNECTION:
                this.#drag_object!.element.classList.remove("invalid");
                (this.#drag_object as connection).target = ev;
                this.#drag_object!.update();
                break;

            case drag_state.GRID:
                {
                    let scroll_x = this.#container.scrollLeft - ev.movementX;
                    let scroll_y = this.#container.scrollTop - ev.movementY;
                    while (scroll_x < 0) {
                        scroll_x += grid.MAJOR;
                        this.#offset_x += grid.MAJOR;
                    }
                    while (scroll_y < 0) {
                        scroll_y += grid.MAJOR;
                        this.#offset_y += grid.MAJOR;
                    }
                    const max_x = this.#grid.clientWidth - this.#container.clientWidth;
                    while (scroll_x >= max_x) {
                        scroll_x -= grid.MAJOR;
                        this.#offset_x -= grid.MAJOR;
                    }
                    const max_y = this.#grid.clientHeight - this.#container.clientHeight;
                    while (scroll_y >= max_y) {
                        scroll_y -= grid.MAJOR;
                        this.#offset_y -= grid.MAJOR;
                    }
                    this.#container.scrollTo(scroll_x, scroll_y);
                    this.#offset.style.left = `${this.#offset_x}px`;
                    this.#offset.style.top = `${this.#offset_y}px`;
                }
                break;

            case drag_state.NONE:
                return;
        }
        ev.stopPropagation();
    }

    #mouse_up(ev: Event) {
        switch (this.#drag_state) {
            case drag_state.BLOCK:
            case drag_state.NEW_BLOCK:
                {
                    const block = this.#drag_object as block;
                    const redo = [block.element.style.left, block.element.style.top];
                    const undo = this.#drag_start;
                    if (this.#drag_state === drag_state.BLOCK) {
                        if (redo[0] !== undo[0] || redo[1] !== undo[1]) {
                            toolbar.instance.handle_action(() => {
                                block.element.style.left = redo[0];
                                block.element.style.top = redo[1];
                                block.update();
                            }, () => {
                                block.element.style.left = undo[0];
                                block.element.style.top = undo[1];
                                block.update();
                            });
                        }
                    } else {
                        toolbar.instance.handle_action(() => {
                            if (block.element.parentElement === null) {
                                this.#add_block(block);
                            }
                        }, () => {
                            block.remove();
                        });
                    }
                }
                break;

            case drag_state.CONNECTION:
                if (((this.#drag_object as connection).target instanceof MouseEvent) || this.#drag_object!.element.classList.contains("invalid")) {
                    this.#drag_object!.element.remove();
                } else {
                    const connection = this.#drag_object as connection;
                    toolbar.instance.handle_action(() => {
                        this.#add_connection(connection);
                    }, () => {
                        connection.remove();
                    });
                }
                break;

            case drag_state.GRID:
                break;

            case drag_state.NONE:
                return;
        }
        this.#drag_object = null;
        this.#drag_state = drag_state.NONE;
        ev.stopPropagation();
    }
}
