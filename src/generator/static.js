"use strict";

led_controller_toolbar.register_block("Static Color", "generators", class extends led_controller_block {
    /**
     * @type {HTMLInputElement}
     */
    #color;

    constructor(color = "#FFFFFF") {
        super("Static Color", 130, 70);
        this.add_connector(30, false);
        this.#color = this.add_color_input("Color", color);
    }

    /**
     * @returns {led_controller_block}
     */
    copy() {
        return new (this.constructor)(this.#color.value);
    }
});
