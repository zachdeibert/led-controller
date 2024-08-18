import block from "./block";
import connection from "./connection";
import connector from "./connector";
import { check, node } from "./dag";

export default class net {
    readonly connections: connection[];

    get driver(): connector | null {
        const conn = this.connections.find(conn => conn.origin.output || (conn.target as connector).output);
        if (conn === undefined) {
            return null;
        } else if (conn.origin.output) {
            return conn.origin;
        } else {
            return conn.target as connector;
        }
    }

    constructor() {
        this.connections = [];
    }

    static merge(a: net | null, b: net | null): net {
        const c = new net();
        if (a !== null) {
            c.connections.push(...a.connections);
        }
        if (b !== null) {
            c.connections.push(...b.connections);
        }
        c.connections.forEach(conn => {
            conn.origin.net = c;
            (conn.target as connector).net = c;
        });
        return c;
    }

    split(conn: connection) {
        const origin_net = new net();
        const target_net = new net();
        const new_nets = new Map([
            [conn.origin, origin_net],
            [conn.target as connector, target_net],
        ]);
        let to_sort = [...this.connections];
        to_sort.splice(this.connections.indexOf(conn), 1);
        while (to_sort.length > 0) {
            const orig_size = to_sort.length;
            to_sort = to_sort.filter(c => {
                if (new_nets.has(c.origin)) {
                    const net = new_nets.get(c.origin)!;
                    (c.target as connector).net = net;
                    net.connections.push(c);
                    new_nets.set(c.target as connector, net);
                } else if (new_nets.has(c.target as connector)) {
                    const net = new_nets.get(c.target as connector)!;
                    c.origin.net = net;
                    net.connections.push(c);
                    new_nets.set(c.origin, net);
                } else {
                    return true;
                }
                return false;
            });
            if (to_sort.length === orig_size) {
                throw new TypeError("Unable to split net across connection");
            }
        }
        conn.origin.net = origin_net.connections.length > 0 ? origin_net : null;
        (conn.target as connector).net = target_net.connections.length > 0 ? target_net : null;
    }

    static remains_dag(blocks: block[], new_connection: connection): boolean {
        const block_to_node = new Map<block, node>();
        blocks.forEach(blk => {
            block_to_node.set(blk, new node());
        });
        blocks.forEach(blk => {
            const parent = block_to_node.get(blk);
            blk.dependents.forEach(dependent => {
                parent?.edge_to(block_to_node.get(dependent)!);
            });
        });
        let source: block | null = null;
        let sink: block | null = null;
        if (new_connection.origin.output) {
            source = new_connection.origin.block;
        } else {
            source = new_connection.origin.net?.driver?.block ?? null;
        }
        if (source === null) {
            if ((new_connection.target as connector).output) {
                source = (new_connection.target as connector).block;
            } else {
                source = (new_connection.target as connector).net?.driver?.block ?? null;
            }
            sink = new_connection.origin.block;
        } else {
            sink = (new_connection.target as connector).block;
        }
        if (source !== null) {
            block_to_node.get(source)!.edge_to(block_to_node.get(sink)!);
        }
        return check([...block_to_node.values()]);
    }
};
