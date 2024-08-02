"use strict";

led_controller_block.register(class extends led_controller_block {
    static css_class = "led-outputs-addressable";
    static group     = "led-outputs";
    static name      = "Generic ARGB";
    static title     = "Generic ARGB Output";

    constructor() {
        super();
        this.add_text_input("number", "Pin Number");
        const color_order = this.add_text_input("text", "Color Order");
        color_order.classList.add("block-color-order");
        color_order.value = "RGB";
        color_order.addEventListener("input", () => {
            const orig_value = color_order.value;
            const new_value  = orig_value.toUpperCase().replace(/[^RGBW01]/g, "");
            if (orig_value !== new_value) {
                color_order.value = new_value;
            }
        });
        this.add_switch("400 kHz", "800 kHz").checked        = true;
        this.add_switch("Active Low", "Active High").checked = true;
        this.add_connector("connector");
    }
});
