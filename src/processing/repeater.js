"use strict";

led_controller_block.register(class extends led_controller_block {
    static css_class = "processing-repeater";
    static group     = "processing";
    static name      = "Repeater";
    static title     = "Repeater";

    constructor() {
        super();
        this.add_text_input("number", "Factor").min = 0;
        this.add_connector("connector", true);
        this.add_connector("connector", false);
    }
});
