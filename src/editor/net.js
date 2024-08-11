"use strict";

class led_controller_net {
        /**
         * @type {led_controller_connection[]}
         */
        connections;

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
};
