import { M } from "@materializecss/materialize";
import block_factory from "./block_factory";
import grid from "./grid";

const UNDO_MAX = 100;

export default class toolbar {
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

        block_factory.forEach(block => {
            const editor_group = document.getElementById(`editor-group-${block.group}`) as HTMLDivElement;
            const item = document.createElement("div");
            item.classList.add("collapsible-item", "waves-effect");
            item.innerText = block.title;
            item.addEventListener("click", ev => {
                sidenav.close();
                grid.instance.add_block(new block());
                ev.stopPropagation();
            });
            editor_group.appendChild(item);
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
