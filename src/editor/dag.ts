class edge {
    readonly source: node;
    readonly sink: node;

    constructor(source: node, sink: node) {
        this.source = source;
        this.sink = sink;
    }
};

export class node {
    readonly incoming: Set<edge>;
    readonly outgoing: Set<edge>;

    constructor() {
        this.incoming = new Set();
        this.outgoing = new Set();
    }

    edge_to(other: node) {
        const e = new edge(this, other);
        this.outgoing.add(e);
        other.incoming.add(e);
    }
};

export function check(nodes: node[]): boolean {
    const no_incoming = new Set<node>();
    const with_incoming = new Set<node>();
    nodes.forEach(node => {
        if (node.incoming.size > 0) {
            with_incoming.add(node);
        } else {
            no_incoming.add(node);
        }
    });
    while (no_incoming.size > 0) {
        const n = no_incoming.values().next().value as node;
        no_incoming.delete(n);
        Array(...n.outgoing).forEach(e => {
            e.sink.incoming.delete(e);
            if (e.sink.incoming.size === 0) {
                no_incoming.add(e.sink);
                with_incoming.delete(e.sink);
            }
        });
    }
    return with_incoming.size === 0;
}
