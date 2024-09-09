
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    section.scrollIntoView({ behavior: 'smooth' });
}


let currentPage = 0;
const sections = document.querySelectorAll(".section");

document.addEventListener("wheel", function (event) {
    if (event.deltaY > 0) {
    
        if (currentPage < sections.length - 1) {
            currentPage++;
        }
    } else {
        
        if (currentPage > 0) {
            currentPage--;
        }
    }
    sections[currentPage].scrollIntoView({ behavior: "smooth" });
});


