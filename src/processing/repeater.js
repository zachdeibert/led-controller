"use strict";

led_controller_toolbar.register_block("Repeater", "processing", class extends led_controller_block {
    constructor() {
        super("Repeater", 100, 70);
        this.add_text_input("number", "Factor").min = 0;
        this.add_connector(30, true);
        this.add_connector(30, false);
    }
});
