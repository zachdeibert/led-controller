"use strict";

led_controller_toolbar.register_block("Static Color", "generators", class extends led_controller_block {
    constructor() {
        super("Static Color", 130, 70);
        this.add_color_input("Color");
        this.add_connector(30, false);
    }
});
