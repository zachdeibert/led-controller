import iro from "@jaames/iro";
import { M, Modal } from "@materializecss/materialize";
import connection from "./connection";
import connector from "./connector";
import grid from "./grid";
import toolbar from "./toolbar";

export abstract class generic_block {
    static #color_field: HTMLInputElement;
    static #color_modal: Modal;
    static #color_picker: iro.ColorPicker;
    static #nonce: number;

    #form: HTMLDivElement;

    readonly connectors: connector[];
    readonly element: HTMLDivElement;

    get dependents(): generic_block[] {
        const dependents = new Set<generic_block>();
        this.connectors.forEach(connr => {
            if (connr.output && connr.net !== null) {
                connr.net.connections.forEach(conn => {
                    if (conn.origin.input) {
                        dependents.add(conn.origin.block);
                    }
                    const target = conn.target as connector;
                    if (target.input) {
                        dependents.add(target.block);
                    }
                });
            }
        });
        return [...dependents];
    }

    static {
        document.addEventListener("DOMContentLoaded", () => {
            const color_modal = document.getElementById("editor-color-modal") as HTMLDivElement;
            const color_modal_content = document.getElementById("editor-color-modal-content") as HTMLDivElement;
            const color_modal_ok = document.getElementById("editor-color-modal-ok") as HTMLAnchorElement;

            this.#color_modal = M.Modal.init(color_modal);
            this.#color_picker = iro.ColorPicker(color_modal_content, {});
            this.#nonce = 0;

            color_modal_ok.addEventListener("click", () => {
                this.#color_field.value = this.#color_picker.color.hexString.toUpperCase();
                this.#color_field.dispatchEvent(new Event("input"));
            });
        });
    }

    constructor(title: string, width: number, height: number) {
        this.element = document.createElement("div");
        this.element.style.height = `${height}px`;
        this.element.style.marginLeft = `-${width / 2}px`;
        this.element.style.width = `${width}px`;

        const title_div = document.createElement("div");
        title_div.classList.add("block-title");
        title_div.innerText = title;
        this.element.appendChild(title_div);

        this.#form = document.createElement("div");
        this.#form.classList.add("block-form");
        this.element.appendChild(this.#form);

        this.connectors = [];

        this.element.addEventListener("keydown", ev => {
            ev.stopPropagation();
        });
        title_div.addEventListener("mousedown", ev => {
            if (ev.button === 0) {
                grid.instance.drag_block(this);
                ev.stopPropagation();
            }
        });
        this.element.addEventListener("mousedown", ev => {
            if (ev.button === 0) {
                ev.stopPropagation();
            }
        });
    }

    add_color_input(label_text: string, value: string, on_change: (value: string) => void = () => { }): HTMLInputElement {
        let input: HTMLInputElement; // eslint-disable-line prefer-const

        const update_style = (v: string) => {
            const background = v.padEnd(7, "0");
            // http://stackoverflow.com/a/3943023/112731
            let r = parseInt(background.substring(1, 3), 16) / 255;
            let g = parseInt(background.substring(3, 5), 16) / 255;
            let b = parseInt(background.substring(5, 7), 16) / 255;
            r = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
            g = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
            b = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
            const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            const foreground = l >= 0.179 ? "#000000" : "#FFFFFF";
            input.style.backgroundColor = background;
            input.style.borderColor = foreground;
            input.style.color = foreground;
            on_change(v);
        };

        input = this.add_text_input("text", label_text, value, v => "#" + v.toUpperCase().replace(/[^0-9A-F]/g, "").substring(0, 6), update_style);
        input.style.textAlign = "left";
        update_style(value);

        input.addEventListener("dblclick", ev => {
            generic_block.#color_field = input;
            generic_block.#color_picker.color.hexString = input.value.padEnd(7, "0");
            generic_block.#color_modal.open();
            ev.stopPropagation();
        });

        return input;
    }

    add_connector(y: number, input: boolean) {
        const conn = new connector(this, y, input);
        this.connectors.push(conn);
        this.element.appendChild(conn.element);
    }

    add_switch(off_label: string, on_label: string, value: boolean, on_change: (value: boolean) => void = () => { }): HTMLInputElement {
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
        input.checked = value;
        input.type = "checkbox";
        label.appendChild(input);

        const lever = document.createElement("span");
        lever.classList.add("lever");
        label.appendChild(lever);

        const on = document.createElement("span");
        on.classList.add("switch-label");
        on.innerText = on_label;
        label.appendChild(on);

        input.addEventListener("change", ev => {
            const value = input.checked;
            toolbar.instance.handle_action(() => {
                input.checked = value;
                on_change(value);
            }, () => {
                input.checked = !value;
                on_change(!value);
            });
            ev.stopPropagation();
        });

        return input;
    }

    add_text_input(type: string, label_text: string, value: string, validate: ((value: string) => string) | null = null, on_change: (value: string) => void = () => { }): HTMLInputElement {
        const input_field = document.createElement("div");
        input_field.classList.add("input-field", "outlined");
        this.#form.appendChild(input_field);

        const input = document.createElement("input");
        input.id = `dynamic-block-id-${++generic_block.#nonce}`;
        input.type = type;
        input.value = value;
        input_field.appendChild(input);

        const label = document.createElement("label");
        label.htmlFor = input.id;
        label.innerText = label_text;
        input_field.appendChild(label);

        if (validate === null) {
            switch (type) {
                case "number":
                    validate = v => {
                        v = v.replace(/[^0-9]/g, "");
                        if (v.length === 0) {
                            v = "0";
                        }
                        let i = parseInt(v);
                        if (input.min.length > 0) {
                            const b = parseInt(input.min);
                            if (i < b) {
                                i = b;
                            }
                        }
                        if (input.max.length > 0) {
                            const b = parseInt(input.max);
                            if (i > b) {
                                i = b;
                            }
                        }
                        return i.toString();
                    };
                    break;

                default:
                    validate = v => v;
                    break;
            }
        }

        let prev_value = value;
        input.addEventListener("input", ev => {
            const orig_value = input.value;
            const old_value = prev_value;
            if (orig_value.length === 0 && !input.checkValidity()) {
                input.value = old_value;
            } else {
                const new_value = validate(orig_value);
                if (new_value !== old_value) {
                    toolbar.instance.handle_action(() => {
                        input.value = new_value;
                        prev_value = new_value;
                        on_change(new_value);
                    }, () => {
                        input.value = old_value;
                        prev_value = old_value;
                        on_change(old_value);
                    });
                } else if (new_value !== orig_value) {
                    input.value = new_value;
                }
            }
            ev.stopPropagation();
        });

        return input;
    }

    remove(): connection[] {
        const removed: connection[] = [];
        this.connectors.forEach(connr => {
            if (connr.net !== null) {
                connr.net.connections.forEach(conn => {
                    if (conn.origin === connr || conn.target === connr) {
                        conn.remove();
                        removed.push(conn);
                    }
                });
            }
        });
        this.element.remove();
        grid.instance.remove_block(this);
        return removed;
    }

    update() {
        this.connectors.forEach(connr => {
            if (connr.net !== null) {
                connr.net.connections.forEach(conn => {
                    if (conn.origin === connr || conn.target === connr) {
                        conn.update();
                    }
                });
            }
        });
    }
};

export default abstract class block<T> extends generic_block { // eslint-disable-line @typescript-eslint/no-unnecessary-type-parameters
    abstract save(): T;
};
