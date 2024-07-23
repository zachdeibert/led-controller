cmake_minimum_required(VERSION 3.13)
include(../../module/pico-core/init.cmake)
project(led_controller_rp2040)
pico_sdk_init()

add_subdirectory(../.. core)

add_executable(led_controller
    src/main.cpp
)
target_link_libraries(led_controller
    led_controller_lib
    pico_stdlib
)
pico_add_extra_outputs(led_controller)
pico_add_flash_target(led_controller)
pico_enable_stdio_uart(led_controller 0)
pico_enable_stdio_usb(led_controller 1)
