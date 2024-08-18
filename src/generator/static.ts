import block from "../editor/block";
import toolbar from "../editor/toolbar";

toolbar.register_block("Static Color", "generators", class static_color extends block {
    #color: HTMLInputElement;

    constructor(color = "#FFFFFF") {
        super("Static Color", 130, 70);
        this.add_connector(30, false);
        this.#color = this.add_color_input("Color", color);
    }

    copy(): block {
        return new static_color(this.#color.value);
    }
});
