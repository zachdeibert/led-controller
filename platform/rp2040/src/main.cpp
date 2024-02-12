#include <iostream>
#include <pico/stdlib.h>

using namespace std;

int main() {
    stdio_init_all();
    while (true) {
        cout << "Hello, world!" << endl;
        sleep_ms(1000);
    }
}
