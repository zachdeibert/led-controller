"use strict";

led_controller_block.register(class extends led_controller_block {
    static group = "led-outputs";
    static name  = "Generic ARGB";

    /**
     * @type {HTMLElement}
     */
    #root_element;

    /**
     * @returns {HTMLElement}
     */
    get root_element() {
        return this.#root_element;
    }

    constructor() {
        super();
        this.#root_element = document.createElement("div");
        this.#root_element.classList.add("led-outputs-addressable");

        const title = document.createElement("div");
        title.classList.add("block-title");
        title.innerText = "Generic ARGB Output";
        this.#root_element.appendChild(title);
    }
});
