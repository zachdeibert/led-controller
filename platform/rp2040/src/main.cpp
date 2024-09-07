#include <iostream>
#include <stdint.h>
#include <pico/stdlib.h>
#include <pb_decode.h>
#include <pb_encode.h>
#include <zachdeibert/led-controller/proto/block.pb.h>

using namespace std;
using block = zachdeibert_led_controller_proto_block;

int main() {
    stdio_init_all();
    block orig = zachdeibert_led_controller_proto_block_init_zero;
    orig.x     = 1234;
    uint8_t buffer[128];
    pb_ostream_t ostream = pb_ostream_from_buffer(buffer, sizeof(buffer));
    ostream << orig;
    block copy           = zachdeibert_led_controller_proto_block_init_zero;
    pb_istream_t istream = pb_istream_from_buffer(buffer, ostream.bytes_written);
    istream >> copy;
    while (true) {
        cout << "Hello, world " << copy.x << "!" << endl;
        sleep_ms(1000);
    }
}
