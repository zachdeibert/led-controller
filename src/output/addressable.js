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

    constructor(pin_number = 0, color_order = "RGB", high_freq = true, active_high = true) {
        super("Generic ARGB Output", 200, 160);
        this.add_connector(70, true);
        this.#pin_number  = this.add_text_input("number", "Pin Number", pin_number.toString());
        this.#color_order = this.add_text_input(
                "text", "Color Order", color_order, v => v.toUpperCase().replace(/[^RGBW01]/g, ""));
        this.#color_order.style.letterSpacing = "10px";
        this.#color_order.style.textAlign     = "center";
        this.#frequency                       = this.add_switch("400 kHz", "800 kHz", high_freq);
        this.#polarity                        = this.add_switch("Active Low", "Active High", active_high);
    }

    /**
     * @returns {led_controller_block}
     */
    copy() {
        return new (this.constructor)(parseInt(this.#pin_number.value),
                                      this.#color_order.value,
                                      this.#frequency.checked,
                                      this.#polarity.checked);
    }
});
