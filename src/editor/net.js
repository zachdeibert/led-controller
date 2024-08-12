"use strict";

class led_controller_net {
        /**
         * @type {led_controller_connection[]}
         */
        connections;

        /**
         * @returns {led_controller_connector | null}
         */
        get driver() {
            const connection
                    = this.connections.find(connection => connection.origin.output || connection.target.output);
            if (connection === undefined) {
                return null;
            } else if (connection.origin.output) {
                return connection.origin;
            } else {
                return connection.target;
            }
        }

        constructor() {
            this.connections = [];
        }

        /**
         * @param {led_controller_net | null} a
         * @param {led_controller_net | null} b
         * @returns {led_controller_net}
         */
        static merge(a, b) {
            const c = new led_controller_net();
            if (a !== null) {
                c.connections.push(...a.connections);
            }
            if (b !== null) {
                c.connections.push(...b.connections);
            }
            c.connections.forEach(connection => {
                connection.origin.net = c;
                connection.target.net = c;
            });
            return c;
        }

        /**
         * @param {led_controller_block[]} blocks
         * @param {led_controller_connection} new_connection
         * @returns {boolean}
         */
        static remains_dag(blocks, new_connection) {
            /**
             * @type {Map<led_controller_block, led_controller_dag_node}
             */
            const block_to_node = new Map();
            blocks.forEach(block => { block_to_node.set(block, new led_controller_dag_node()); });
            blocks.forEach(block => {
                const parent = block_to_node.get(block);
                block.dependents.forEach(dependent => { parent.edge_to(block_to_node.get(dependent)); });
            });
            /**
             * @type {led_controller_block | null}
             */
            let source = null;
            /**
             * @type {led_controller_block | null}
             */
            let sink   = null;
            if (new_connection.origin.output) {
                source = new_connection.origin.block;
            } else if (new_connection.origin.net !== null) {
                const driver = new_connection.origin.net.driver;
                if (driver !== null) {
                    source = driver.block;
                }
            }
            if (source === null) {
                if (new_connection.target.output) {
                    source = new_connection.target.block;
                } else if (new_connection.target.net !== null) {
                    const driver = new_connection.target.net.driver;
                    if (driver !== null) {
                        source = driver.block;
                    }
                }
                sink = new_connection.origin.block;
            } else {
                sink = new_connection.target.block;
            }
            if (source !== null) {
                block_to_node.get(source).edge_to(block_to_node.get(sink));
            }
            return led_controller_dag_check(Array(...block_to_node.values()));
        }
};
