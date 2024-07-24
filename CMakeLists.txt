find_package(Nanopb REQUIRED COMPONENTS cpp-descriptors)

add_subdirectory(module/pico-core)

nanopb_generate_cpp(
    TARGET led_controller_proto
    RELPATH include
    include/root.proto
    include/zachdeibert/led-controller/proto/device_config.proto
)

add_library(led_controller_lib STATIC
    src/empty.cpp
)
target_link_libraries(led_controller_lib
    led_controller_proto
)
