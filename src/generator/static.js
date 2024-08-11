"use strict";

led_controller_toolbar.register_block("Static Color", "generators", class extends led_controller_block {
    constructor() {
        super("Static Color", 100, 160);
        const red   = this.add_text_input("number", "Red");
        red.min     = 0;
        red.max     = 255;
        const green = this.add_text_input("number", "Green");
        green.min   = 0;
        green.max   = 255;
        const blue  = this.add_text_input("number", "Blue");
        blue.min    = 0;
        blue.max    = 255;
        this.add_connector(70, false);
    }
});
