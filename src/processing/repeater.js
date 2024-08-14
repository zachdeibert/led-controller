"use strict";

led_controller_toolbar.register_block("Repeater", "processing", class extends led_controller_block {
    /**
     * @type {HTMLInputElement}
     */
    #factor;

    constructor(factor = 1) {
        super("Repeater", 100, 70);
        this.add_connector(30, true);
        this.add_connector(30, false);
        this.#factor     = this.add_text_input("number", "Factor", factor.toString());
        this.#factor.min = 1;
    }

    /**
     * @returns {led_controller_block}
     */
    copy() {
        return new (this.constructor)(parseInt(this.#factor.value));
    }
});
