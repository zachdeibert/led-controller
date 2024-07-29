"use strict";

document.addEventListener("DOMContentLoaded", () => {
    M.Tooltip.init(document.querySelectorAll(".tooltipped"), {});
    const menu = document.getElementById("editor-add-menu");
    M.Sidenav.init([ menu ], { "edge" : "right" });
    M.Collapsible.init([ menu ], { "accordion" : false });
});
