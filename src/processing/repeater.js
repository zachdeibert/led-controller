"use strict";

led_controller_toolbar.register_block("Repeater", "processing", class extends led_controller_block {
    constructor() {
        super("Repeater", 100, 70);
        this.add_text_input("number", "Factor").min = 0;
        this.element.appendChild(new led_controller_connector(this, 30, true).element);
        this.element.appendChild(new led_controller_connector(this, 30, false).element);
    }
});
