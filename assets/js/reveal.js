// assets/js/reveal.js
document.addEventListener("DOMContentLoaded", () => {
    const els = document.querySelectorAll(".reveal");

    const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) {
                e.target.classList.add("is-in");
                io.unobserve(e.target); // sekali muncul saja
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -10% 0px"
    });

    els.forEach(el => io.observe(el));
});