import { block_oneof } from "../proto-index";
import { Iblock } from "../proto";
import block, { generic_block } from "./block";

type block_name = keyof typeof block_oneof;

function block_type_helper() { // eslint-disable-line @typescript-eslint/no-unused-vars
    const blk: Iblock | null = null;
    const name: block_name | null = null;
    return blk![name!]!;
}
type block_iface = ReturnType<typeof block_type_helper>;

type group_name = "led-outputs" | "control-inputs" | "processing" | "generators" | "utilities";

interface generic_block_impl {
    group: group_name,
    title: string,
    new(): generic_block,
};

interface block_impl<S extends block_name> {
    group: group_name,
    proto: S,
    title: string,
    new(data?: block_iface & Iblock[S]): block<block_iface & Iblock[S]>,
};

const impls: generic_block_impl[] = [];
let loaded = false;

document.addEventListener("DOMContentLoaded", () => {
    loaded = true;
});

function register<S extends block_name>(type: block_impl<S>) {
    if (loaded) {
        throw new TypeError("All block subclasses must be registered before the DOM loads");
    }
    const super_load = block_factory.load;
    block_factory.load = (data: Iblock): generic_block | undefined => {
        const field = data[type.proto];
        if (field != null && block_oneof[type.proto].verify(field) === null) {
            return new type(field);
        }
        return super_load(data);
    };
    const super_save = block_factory.save;
    block_factory.save = (blk: generic_block): Iblock => {
        if (blk instanceof type) {
            const obj: Iblock = {};
            obj[type.proto] = blk.save();
            return obj;
        }
        return super_save(blk);
    };
    impls.push(type);
};

const block_factory = {
    "forEach": (callbackfn: (value: generic_block_impl) => void) => {
        impls.forEach(value => {
            callbackfn(value);
        });
    },

    "load": (data: Iblock): generic_block | undefined => { // eslint-disable-line @typescript-eslint/no-unused-vars
        return undefined;
    },

    "save": (blk: generic_block): Iblock => { // eslint-disable-line @typescript-eslint/no-unused-vars
        return {};
    },

    "register": register,
};

export default block_factory;
