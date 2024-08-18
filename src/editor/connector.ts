import block from "./block";
import grid from "./grid";
import net from "./net";

export default class connector {
    readonly block: block;
    readonly element: HTMLDivElement;
    readonly input: boolean;
    net: net | null;

    get output(): boolean {
        return !this.input;
    }

    constructor(block: block, y: number, input: boolean) {
        this.element = document.createElement("div");
        this.element.classList.add("block-connector", input ? "block-connector-input" : "block-connector-output");
        this.element.style.top = `${y}px`;

        this.block = block;
        this.input = input;
        this.net = null;

        this.element.addEventListener("mousedown", ev => {
            if (ev.button !== 2) {
                grid.instance.drag_connector(this);
                ev.stopPropagation();
            }
        });
        this.element.addEventListener("mousemove", ev => {
            if (ev.button !== 2) {
                grid.instance.hover_connector(this);
                ev.stopPropagation();
            }
        });
    }
};
