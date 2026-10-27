// A page's section tabs: one panel at a time, chosen by the address's #name (so old links still land on their
// section), the tab clicked, or the arrow keys. Without this script every section shows, as one page.
(function () {
  var list = document.querySelector(".tabs [role='tablist']");
  if (!list) return;
  var tabs = Array.prototype.slice.call(list.querySelectorAll("[role='tab']"));
  var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute("aria-controls")); });
  document.documentElement.classList.add("tabbed");

  function index(name) {
    if (!name) return -1;
    for (var i = 0; i < panels.length; i++) {
      if (panels[i].id === name) return i;
      try { if (panels[i].querySelector("#" + CSS.escape(name))) return i; } catch (e) {}
    }
    return -1;
  }

  function show(i, scroll) {
    tabs.forEach(function (t, j) {
      var on = i === j;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      panels[j].hidden = !on;
    });
    var left = tabs[i].getBoundingClientRect().left - list.getBoundingClientRect().left + list.scrollLeft;
    list.scrollLeft = Math.max(0, left - list.clientWidth / 2 + tabs[i].clientWidth / 2);  // the strip scrolls itself
    if (scroll) {  // to the panel's start, if the reader is below it
      var bars = document.querySelector(".sitebar").offsetHeight + list.closest(".tabs").offsetHeight;
      var top = panels[i].getBoundingClientRect().top + window.pageYOffset - bars;
      if (window.pageYOffset > top || scroll === "always") window.scrollTo(0, Math.max(0, top));
    }
  }

  tabs.forEach(function (t, i) {
    t.addEventListener("click", function (e) {
      e.preventDefault();
      show(i, true);
      history.replaceState(null, "", "#" + panels[i].id);
    });
    t.addEventListener("keydown", function (e) {
      var k = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (k === undefined) return;
      e.preventDefault();
      k = (k + tabs.length) % tabs.length;
      show(k, true);
      tabs[k].focus();
      history.replaceState(null, "", "#" + panels[k].id);
    });
  });

  window.addEventListener("hashchange", function () {  // a "Next" button, or a link to a section on this page
    var i = index(location.hash.slice(1));
    if (i >= 0) show(i, "always");
  });

  var first = index(location.hash.slice(1));
  show(first >= 0 ? first : 0, first >= 0 ? "always" : false);
})();
