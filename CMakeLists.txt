find_package(Nanopb REQUIRED COMPONENTS cpp-descriptors)

add_subdirectory(module/pico-core)

nanopb_generate_cpp(
    TARGET led_controller_proto
    RELPATH include
    include/zachdeibert/led-controller/proto/generator/static_color.proto
    include/zachdeibert/led-controller/proto/output/addressable.proto
    include/zachdeibert/led-controller/proto/processing/repeater.proto
    include/zachdeibert/led-controller/proto/block.proto
    include/zachdeibert/led-controller/proto/connection.proto
    include/zachdeibert/led-controller/proto/device_config.proto
    include/zachdeibert/led-controller/proto/editor_config.proto
    include/root.proto
)

add_library(led_controller_lib STATIC
    src/empty.cpp
)
target_link_libraries(led_controller_lib
    led_controller_proto
)
