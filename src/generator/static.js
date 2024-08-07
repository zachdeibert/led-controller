"use strict";

led_controller_block.register(class extends led_controller_block {
    static css_class = "generators-static";
    static group     = "generators";
    static name      = "Static Color";
    static title     = "Static Color";

    constructor() {
        super();
        const red   = this.add_text_input("number", "Red");
        red.min     = 0;
        red.max     = 255;
        const green = this.add_text_input("number", "Green");
        green.min   = 0;
        green.max   = 255;
        const blue  = this.add_text_input("number", "Blue");
        blue.min    = 0;
        blue.max    = 255;
        this.add_connector("connector", false);
    }
});
