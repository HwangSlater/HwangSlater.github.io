/* 스크롤 따라 연출 — 읽는 만큼 소개 글이 진해지고, 쿠폰 단계 선이 채워지고, TPS 숫자가 올라가고, 첫 화면이 물러난다.
 * 움직임 줄이기를 켠 사람에게는 돌지 않는다(그때는 components.css 의 기본 나타나기만). 값은 tokens.css. */
(function () {
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var WORD_LINE = 0.5;   /* 낱말은 화면 위에서 이 비율 줄을 지나면 켜진다 */
  var STEP_LINE = 0.6;   /* 쿠폰 단계 선이 채워지는 기준 줄 */
  var DOT_CENTER = 14;   /* 단계 번호 동그라미 가운데(components.css .steps li::before 26px + 위 1px) */

  /* 소개 글을 낱말(띄어쓰기 단위)로 나눈다. 글자는 그대로라 읽기 프로그램에는 같은 글이다 */
  var words = [];
  document.querySelectorAll(".about p").forEach(function (p) {
    var walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT), nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (t) {
      var frag = document.createDocumentFragment();
      t.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var s = document.createElement("span");
        s.className = "w"; s.textContent = part;
        frag.appendChild(s); words.push(s);
      });
      t.parentNode.replaceChild(frag, t);
    });
  });
  var about = document.querySelector(".about");
  if (about && words.length) about.classList.add("by-scroll");

  /* 쿠폰 단계 채우는 선 */
  var steps = document.querySelector(".steps"), fill = null, items = [];
  if (steps) {
    fill = document.createElement("span");
    fill.className = "fill"; fill.setAttribute("aria-hidden", "true");
    items = Array.prototype.slice.call(steps.querySelectorAll("li"));
    if (items.length) { steps.prepend(fill); steps.classList.add("by-scroll"); } else steps = null;
  }
  var hero = document.querySelector(".hero");

  /* 선은 첫 번호 가운데에서 마지막 번호 가운데까지만 — 크기는 폭이 바뀔 때만 잰다(스크롤마다 재면 화면을 다시 계산한다) */
  var span = 0;
  var measure = function () {
    if (!steps) return;
    span = items[items.length - 1].offsetTop - items[0].offsetTop;
    fill.style.top = items[0].offsetTop + DOT_CENTER + "px";
    fill.style.height = span + "px";
  };

  var clamp = function (v) { return Math.max(0, Math.min(1, v)); };
  var paint = function () {
    var vh = innerHeight, line = vh * WORD_LINE, mid = vh * STEP_LINE;
    for (var i = 0; i < words.length; i++) words[i].classList.toggle("lit", words[i].getBoundingClientRect().top < line);
    if (hero) {
      var out = clamp(scrollY / hero.offsetHeight);
      hero.style.setProperty("--out", out.toFixed(3));
      hero.classList.toggle("scrolling", out > 0);
    }
    if (steps) {
      var start = items[0].getBoundingClientRect().top + DOT_CENTER;
      fill.style.setProperty("--p", clamp(span ? (mid - start) / span : 0).toFixed(3));
      items.forEach(function (li) { li.classList.toggle("on", li.getBoundingClientRect().top + DOT_CENTER < mid); });
    }
  };
  /* 스크롤은 한 프레임에 한 번만 그린다 */
  var queued = false;
  addEventListener("scroll", function () {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; paint(); });
  }, { passive: true });
  addEventListener("resize", function () { measure(); paint(); });
  measure(); paint();
  /* 글꼴이 늦게 오면 줄바꿈이 바뀌어 번호 자리도 바뀐다 */
  if (document.fonts) document.fonts.ready.then(function () { measure(); paint(); });

  /* TPS 숫자 — 화면 아래 30% 위로 들어오면 0 에서 올라간다 */
  var countMs = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--count-dur")) || 0;
  document.querySelectorAll(".steps .num").forEach(function (el) {
    var m = el.textContent.match(/^(\D*)([\d,]+)(.*)$/);
    if (!m || !countMs) return;
    var target = +m[2].replace(/,/g, "");
    new IntersectionObserver(function (es, io) {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      var t0 = performance.now();
      var step = function (now) {
        var k = clamp((now - t0) / countMs), e = 1 - Math.pow(1 - k, 3);
        el.textContent = m[1] + Math.round(target * e).toLocaleString("en-US") + m[3];
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { rootMargin: "0px 0px -30% 0px" }).observe(el);
  });
})();
