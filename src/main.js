"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const GRID_SIZE_MAJOR = 50;

    const editor_add_menu  = document.getElementById("editor-add-menu");
    const editor_container = document.getElementById("editor-container");
    const editor_grid      = document.getElementById("editor-grid");
    const editor_offset    = document.getElementById("editor-offset");

    M.Tooltip.init(document.querySelectorAll(".tooltipped"), {});
    M.Sidenav.init([ editor_add_menu ], { "edge" : "right" });
    M.Collapsible.init([ editor_add_menu ], { "accordion" : false });

    {
        let mouse_down = false;
        let offset_x   = 0;
        let offset_y   = 0;
        editor_grid.addEventListener("mousedown", ev => {
            if (ev.button !== 2) {
                mouse_down = true;
            }
        });
        editor_grid.addEventListener("mouseleave", () => { mouse_down = false; });
        editor_grid.addEventListener("mousemove", ev => {
            if (mouse_down) {
                let scroll_x = editor_container.scrollLeft - ev.movementX;
                let scroll_y = editor_container.scrollTop - ev.movementY;
                while (scroll_x < 0) {
                    scroll_x += GRID_SIZE_MAJOR;
                    offset_x += GRID_SIZE_MAJOR;
                }
                while (scroll_y < 0) {
                    scroll_y += GRID_SIZE_MAJOR;
                    offset_y += GRID_SIZE_MAJOR;
                }
                const max_x = editor_grid.clientWidth - editor_container.clientWidth;
                while (scroll_x >= max_x) {
                    scroll_x -= GRID_SIZE_MAJOR;
                    offset_x -= GRID_SIZE_MAJOR;
                }
                const max_y = editor_grid.clientHeight - editor_container.clientHeight;
                while (scroll_y >= max_y) {
                    scroll_y -= GRID_SIZE_MAJOR;
                    offset_y -= GRID_SIZE_MAJOR;
                }
                editor_container.scrollTo(scroll_x, scroll_y);
                editor_offset.style.left = `${offset_x}px`;
                editor_offset.style.top  = `${offset_y}px`;
            }
        });
        editor_grid.addEventListener("mouseout", () => { mouse_down = false; });
        editor_grid.addEventListener("mouseup", () => { mouse_down = false; });
    }
});
