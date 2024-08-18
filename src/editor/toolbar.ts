import { M } from "@materializecss/materialize";
import block from "./block";
import grid from "./grid";

const UNDO_MAX = 100;

export default class toolbar {
    static #block_types = new Map<string, [string, new () => block][]>([
        ["control-inputs", []],
        ["generators", []],
        ["led-outputs", []],
        ["processing", []],
        ["utilities", []],
    ]);

    static instance: toolbar;

    #redo_stack: [() => void, () => void][];
    #undo_stack: [() => void, () => void][];

    static {
        document.addEventListener("DOMContentLoaded", () => {
            this.instance = new toolbar();
        });
    }

    constructor() {
        const editor_add_menu = document.getElementById("editor-add-menu") as HTMLAnchorElement;
        const editor_toolbar_redo = document.getElementById("editor-toolbar-redo") as HTMLAnchorElement;
        const editor_toolbar_undo = document.getElementById("editor-toolbar-undo") as HTMLAnchorElement;

        this.#redo_stack = [];
        this.#undo_stack = [];

        M.Collapsible.init(editor_add_menu, {
            "accordion": false,
        });
        const sidenav = M.Sidenav.init(editor_add_menu, {
            "edge": "right"
        });
        M.Tooltip.init(document.querySelectorAll(".tooltipped"));

        toolbar.#block_types.forEach((blocks, k) => {
            const editor_group = document.getElementById(`editor-group-${k}`) as HTMLDivElement;
            blocks.forEach(block_type => {
                const item = document.createElement("div");
                item.classList.add("collapsible-item", "waves-effect");
                item.innerText = block_type[0];
                item.addEventListener("click", ev => {
                    sidenav.close();
                    grid.instance.add_block(new block_type[1]());
                    ev.stopPropagation();
                });
                editor_group.appendChild(item);
            });
        });

        window.addEventListener("keydown", ev => {
            this.#key_down(ev);
        });
        editor_toolbar_redo.addEventListener("click", ev => {
            this.#redo();
            ev.stopPropagation();
        });
        editor_toolbar_undo.addEventListener("click", ev => {
            this.#undo();
            ev.stopPropagation();
        });
    }

    static register_block(name: string, group: string, type: new () => block) {
        if (toolbar.instance != null) { // eslint-disable-line @typescript-eslint/no-unnecessary-condition
            throw new TypeError("All block subclasses must be registered before the DOM loads");
        } else if (this.#block_types.get(group)?.push([name, type]) == null) {
            throw new TypeError(`Invalid group value "${group}"`);
        }
    }

    handle_action(redo_action: () => void, undo_action: () => void) {
        this.#redo_stack = [];
        this.#undo_stack.push([redo_action, undo_action]);
        if (this.#undo_stack.length > UNDO_MAX) {
            this.#undo_stack.splice(0, 1);
        }
        redo_action();
    }

    #key_down(ev: KeyboardEvent) {
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
