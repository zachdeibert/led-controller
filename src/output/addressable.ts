import block_factory from "../editor/block_factory";
import block from "../editor/block";
import { output } from "../proto";

block_factory.register(class addressable extends block<output.Iaddressable> {
    static readonly group = "led-outputs";
    static readonly proto = "output_addressable";
    static readonly title = "Generic ARGB";

    #pin_number: HTMLInputElement;
    #color_order: HTMLInputElement;
    #frequency: HTMLInputElement;
    #polarity: HTMLInputElement;

    constructor(data?: output.Iaddressable) {
        super("Generic ARGB Output", 200, 160);
        this.add_connector(70, true);
        this.#pin_number = this.add_text_input("number", "Pin Number", (data?.pin ?? 0).toString());
        this.#color_order = this.add_text_input("text", "Color Order", (data?.order ?? "RGB"), v => v.toUpperCase().replace(/[^RGBW01]/g, ""));
        this.#color_order.style.letterSpacing = "10px";
        this.#color_order.style.textAlign = "center";
        const flags = data?.flags ?? (output.addressable.flag.FLAG_800KHZ | output.addressable.flag.FLAG_ACTIVE_HIGH);
        this.#frequency = this.add_switch("400 kHz", "800 kHz", (flags & output.addressable.flag.FLAG_800KHZ) != 0);
        this.#polarity = this.add_switch("Active Low", "Active High", (flags & output.addressable.flag.FLAG_ACTIVE_HIGH) != 0);
    }

    save(): output.Iaddressable {
        return {
            "pin": parseInt(this.#pin_number.value),
            "order": this.#color_order.value,
            "flags": (this.#frequency.checked ? output.addressable.flag.FLAG_800KHZ : 0)
                | (this.#polarity.checked ? output.addressable.flag.FLAG_ACTIVE_HIGH : 0),
        };
    }
});
