import block_factory from "../editor/block_factory";
import block from "../editor/block";
import { processing } from "../proto";

block_factory.register(class repeater extends block<processing.Irepeater> {
    static readonly group = "processing";
    static readonly proto = "processing_repeater";
    static readonly title = "Repeater";

    #factor: HTMLInputElement;

    constructor(data?: processing.Irepeater) {
        super("Repeater", 100, 70);
        this.add_connector(30, true);
        this.add_connector(30, false);
        this.#factor = this.add_text_input("number", "Factor", (data?.factor ?? 1).toString());
        this.#factor.min = "1";
    }

    save(): processing.Irepeater {
        return {
            "factor": parseInt(this.#factor.value),
        };
    }
});
