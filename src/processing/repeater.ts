import block from "../editor/block";
import toolbar from "../editor/toolbar";

toolbar.register_block("Repeater", "processing", class repeater extends block {
    #factor: HTMLInputElement;

    constructor(factor = 1) {
        super("Repeater", 100, 70);
        this.add_connector(30, true);
        this.add_connector(30, false);
        this.#factor = this.add_text_input("number", "Factor", factor.toString());
        this.#factor.min = "1";
    }

    copy(): block {
        return new repeater(parseInt(this.#factor.value));
    }
});
