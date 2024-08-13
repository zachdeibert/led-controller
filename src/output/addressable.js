"use strict";

led_controller_toolbar.register_block("Generic ARGB", "led-outputs", class extends led_controller_block {
    /**
     * @type {HTMLInputElement}
     */
    #pin_number;

    /**
     * @type {HTMLInputElement}
     */
    #color_order;

    /**
     * @type {HTMLInputElement}
     */
    #frequency;

    /**
     * @type {HTMLInputElement}
     */
    #polarity;

    constructor() {
        super("Generic ARGB Output", 200, 160);
        this.add_connector(70, true);
        this.#pin_number                      = this.add_text_input("number", "Pin Number");
        this.#color_order                     = this.add_text_input("text", "Color Order");
        this.#color_order.style.letterSpacing = "10px";
        this.#color_order.style.textAlign     = "center";
        this.#color_order.value               = "RGB";
        this.#color_order.addEventListener("input", () => {
            const orig_value = this.#color_order.value;
            const new_value  = orig_value.toUpperCase().replace(/[^RGBW01]/g, "");
            if (orig_value !== new_value) {
                this.#color_order.value = new_value;
            }
        });
        this.#frequency         = this.add_switch("400 kHz", "800 kHz");
        this.#frequency.checked = true;
        this.#polarity          = this.add_switch("Active Low", "Active High");
        this.#polarity.checked  = true;
    }

    /**
     * @returns {led_controller_block}
     */
    copy() {
        /**
         * @type {this}
         */
        const copy              = new (this.constructor)();
        copy.#pin_number.value  = this.#pin_number.value;
        copy.#color_order.value = this.#color_order.value;
        copy.#frequency.checked = this.#frequency.checked;
        copy.#polarity.checked  = this.#polarity.checked;
        return copy;
    }
});
