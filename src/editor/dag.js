"use strict";

class led_controller_dag_edge {
        /**
         * @type {led_controller_dag_node}
         */
        source;

        /**
         * @type {led_controller_dag_node}
         */
        sink;

        /**
         * @param {led_controller_dag_node} source
         * @param {led_controller_dag_node} sink
         */
        constructor(source, sink) {
            this.source = source;
            this.sink   = sink;
        }
};

class led_controller_dag_node {
        /**
         * @type {Set<led_controller_dag_edge>}
         */
        incoming;

        /**
         * @type {Set<led_controller_dag_edge>}
         */
        outgoing;

        constructor() {
            this.incoming = new Set();
            this.outgoing = new Set();
        }

        /**
         * @param {led_controller_dag_node} other
         */
        edge_to(other) {
            const edge = new led_controller_dag_edge(this, other);
            this.outgoing.add(edge);
            other.incoming.add(edge);
        }
};

/**
 * @param {led_controller_dag_node[]} nodes
 * @returns {boolean}
 */
function led_controller_dag_check(nodes) {
    /**
     * @type {Set<led_controller_dag_node>}
     */
    const no_incoming   = new Set();
    /**
     * @type {Set<led_controller_dag_node>}
     */
    const with_incoming = new Set();
    nodes.forEach(node => {
        if (node.incoming.size > 0) {
            with_incoming.add(node);
        } else {
            no_incoming.add(node);
        }
    });
    while (no_incoming.size > 0) {
        /**
         * @type {led_controller_dag_node}
         */
        const node = no_incoming.values().next().value;
        no_incoming.delete(node);
        Array(...node.outgoing).forEach(edge => {
            edge.sink.incoming.delete(edge);
            if (edge.sink.incoming.size == 0) {
                no_incoming.add(edge.sink);
                with_incoming.delete(edge.sink);
            }
        });
    }
    return with_incoming.size === 0;
}
