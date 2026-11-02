/* 움직임과 탭 따라가기. 이 파일이 없거나 실패해도 내용은 전부 보인다(숨김은 html.js 일 때만). */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var showAll = function () { document.querySelectorAll(".reveal, .steps").forEach(function (el) { el.classList.add("is-in"); }); };
  /* ⚠️ 자동 브라우저(캡처·미리보기 봇)는 html 의 scroll-behavior: smooth 때문에 스크롤이 목적지에 닿기 전에 다음 칸으로
   *    넘어가, 아래 구역이 켜지지 않은 채 찍혔다(2026-11-02). 사람이 아니면 처음부터 다 보여 준다. */
  /* 제목·열 이름도 나타나게. 한 열 안 카드는 차례로(왼쪽 열 먼저) */
  document.querySelectorAll(".sec-head, .col-label").forEach(function (el) { el.classList.add("reveal"); });
  document.querySelectorAll(".two > div").forEach(function (col, c) {
    col.querySelectorAll(".card.reveal").forEach(function (card, i) {
      card.style.setProperty("--d", "calc(var(--stagger) * " + (c + i * 2) + ")");
    });
  });
  if (reduce || navigator.webdriver || !("IntersectionObserver" in window)) { showAll(); return; }

  /* 이름을 글자마다 나눈다. 화면 읽기 프로그램은 통째로 읽게 */
  var h1 = document.querySelector(".hero h1");
  if (h1) {
    var name = h1.textContent;
    h1.setAttribute("aria-label", name);
    h1.textContent = "";
    Array.prototype.forEach.call(name, function (ch, i) {
      var s = document.createElement("span");
      s.className = "ch"; s.setAttribute("aria-hidden", "true"); s.style.setProperty("--i", i); s.textContent = ch;
      h1.appendChild(s);
    });
  }
  /* 숨긴 상태를 한 번 그려 둬야 처음부터 화면 안에 있던 것도 나타나는 게 보인다 */
  void document.body.offsetHeight;

  /* 읽은 만큼 위쪽 빨간 줄 */
  var bar = document.createElement("div");
  bar.className = "progress"; bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);
  var paintBar = function () {
    var max = root.scrollHeight - window.innerHeight;
    bar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
  };
  paintBar();

  /* 카드가 마우스를 따라 살짝 기운다(마우스가 있을 때만) */
  var MAX_TILT_DEG = 5;
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".card").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(900px) rotateX(" + (-y * MAX_TILT_DEG) + "deg) rotateY(" + (x * MAX_TILT_DEG) + "deg) translateY(-3px)";
      });
      card.addEventListener("pointerleave", function () { card.style.transform = ""; });
    });
  }

  /* 구역·카드가 화면 아래 15% 전에 들어오면 켠다. 같은 줄의 카드는 70ms 씩 늦게. */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -15% 0px", threshold: 0 });
  document.querySelectorAll(".reveal, .steps").forEach(function (el) { io.observe(el); });
  /* ⚠️ 관찰자만 믿으면 빈칸이 남는다 — 2026-11-02 캡처에서 아래 네 구역(배포·맡을 수 있는 것·교육·연락)이
   *    통째로 비어 찍혔다. 창 높이를 한 번에 키우거나 빠르게 건너뛰면 관찰자가 켜 주지 못한다.
   *    그래서 스크롤·크기 바뀜·인쇄 때마다 「화면 안에 들어온 것」을 직접 켜는 안전망을 둔다. */
  var sweep = function () {
    var bottom = window.innerHeight;
    document.querySelectorAll(".reveal:not(.is-in), .steps:not(.is-in)").forEach(function (el) {
      if (el.getBoundingClientRect().top < bottom) el.classList.add("is-in");
    });
  };
  var queued = false;
  var onMove = function () { if (queued) return; queued = true; requestAnimationFrame(function () { queued = false; sweep(); paintBar(); }); };
  window.addEventListener("scroll", onMove, { passive: true });
  window.addEventListener("resize", onMove);
  window.addEventListener("beforeprint", showAll);
  setTimeout(sweep, 1200);

  /* 위쪽 탭이 지금 보는 구역을 따라간다 */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tabs a"));
  var secs = tabs.map(function (a) { return document.querySelector(a.getAttribute("href")); }).filter(Boolean);
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      tabs.forEach(function (a) { a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + e.target.id)); });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  secs.forEach(function (s) { spy.observe(s); });
  /* ⚠️ 맨 끝 「연락」 구역은 짧아서 화면 가운데 띠에 닿지 못한다 — 끝까지 내려도 탭이 「맡을 수 있는 것」에 머물렀다.
   *    바닥에 닿으면 마지막 탭을 켠다. */
  window.addEventListener("scroll", function () {
    if (window.innerHeight + window.scrollY < document.documentElement.scrollHeight - 2) return;
    tabs.forEach(function (a, i) { a.setAttribute("aria-current", String(i === tabs.length - 1)); });
  }, { passive: true });

  /* 첫 화면 연락 단추가 보이는 동안 아래 고정 단추는 숨긴다 */
  var dock = document.querySelector(".dock"), heroBtn = document.querySelector(".hero .btn-primary");
  if (dock && heroBtn) {
    new IntersectionObserver(function (e) { dock.classList.toggle("is-hidden", e[0].isIntersecting); }).observe(heroBtn);
  }
})();
