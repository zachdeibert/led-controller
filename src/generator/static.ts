import block_factory from "../editor/block_factory";
import block from "../editor/block";
import { generator } from "../proto";

block_factory.register(class static_color extends block<generator.Istatic_color> {
    static readonly group = "generators";
    static readonly proto = "generator_static";
    static readonly title = "Static Color";

    #color: HTMLInputElement;

    constructor(data?: generator.Istatic_color) {
        super("Static Color", 130, 70);
        this.add_connector(30, false);
        this.#color = this.add_color_input("Color", data?.color != null ? `#${data.color.toString(16).toUpperCase().padStart(6, "0")}` : "#FFFFFF");
    }

    save(): generator.Istatic_color {
        return {
            "color": parseInt(this.#color.value.substring(1).padEnd(6, "0"), 16),
        };
    }
});
