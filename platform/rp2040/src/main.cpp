#include <iostream>
#include <stdint.h>
#include <pico/stdlib.h>
#include <pb_decode.h>
#include <pb_encode.h>
#include <zachdeibert/led-controller/proto/device_config.pb.h>

using namespace std;
using device_config = zachdeibert_led_controller_proto_device_config;

int main() {
    stdio_init_all();
    device_config orig = zachdeibert_led_controller_proto_device_config_init_zero;
    orig.test          = 1234;
    uint8_t buffer[128];
    pb_ostream_t ostream = pb_ostream_from_buffer(buffer, sizeof(buffer));
    ostream << orig;
    device_config copy   = zachdeibert_led_controller_proto_device_config_init_zero;
    pb_istream_t istream = pb_istream_from_buffer(buffer, ostream.bytes_written);
    istream >> copy;
    while (true) {
        cout << "Hello, world " << copy.test << "!" << endl;
        sleep_ms(1000);
    }
}
