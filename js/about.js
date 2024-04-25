
//Button add remove on scroll position
const btnTop = document.querySelector(".top");

window.addEventListener("scroll", () => {
    if (window.scrollY > 80) {
        btnTop.classList.add("scrolled");
    } else {
        btnTop.classList.remove("scrolled");
    }
});