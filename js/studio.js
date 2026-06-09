(function () {
  function bindModeToggle(button) {
    button.addEventListener("click", function () {
      document.body.classList.toggle("studio-focus");
      button.setAttribute(
        "aria-pressed",
        document.body.classList.contains("studio-focus") ? "true" : "false"
      );
    });
  }

  function bindIndexRows() {
    var rows = Array.prototype.slice.call(document.querySelectorAll(".studio-index-row"));
    rows.forEach(function (row) {
      row.addEventListener("mouseenter", function () {
        rows.forEach(function (item) {
          item.classList.toggle("is-active", item === row);
        });
      });
      row.addEventListener("mouseleave", function () {
        row.classList.remove("is-active");
      });
    });
  }

  function bindFilters() {
    var filters = Array.prototype.slice.call(document.querySelectorAll("[data-work-filter]"));
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-work-category]"));

    filters.forEach(function (filter) {
      filter.addEventListener("click", function () {
        var active = filter.getAttribute("data-work-filter");

        filters.forEach(function (button) {
          button.classList.toggle("is-active", button === filter);
        });

        items.forEach(function (item) {
          var category = item.getAttribute("data-work-category");
          item.hidden = active !== "all" && category !== active;
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-studio-mode]")).forEach(bindModeToggle);
    bindIndexRows();
    bindFilters();
  });
})();
