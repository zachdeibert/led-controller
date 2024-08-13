"use strict";

led_controller_toolbar.register_block("Repeater", "processing", class extends led_controller_block {
    /**
     * @type {HTMLInputElement}
     */
    #factor;

    constructor() {
        super("Repeater", 100, 70);
        this.add_connector(30, true);
        this.add_connector(30, false);
        this.#factor     = this.add_text_input("number", "Factor");
        this.#factor.min = 0;
    }

    /**
     * @returns {led_controller_block}
     */
    copy() {
        /**
         * @type {this}
         */
        const copy         = new (this.constructor)();
        copy.#factor.value = this.#factor.value;
        return copy;
    }
});
