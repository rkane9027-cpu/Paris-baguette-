// ========== 1. MENU MOBILE ==========
const menuIcon = document.getElementById('menuIcon');
const navLinks = document.getElementById('navLinks');

menuIcon.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Fermer le menu mobile après clic sur lien
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// ========== 2. ANIMATIONS AU SCROLL (Intersection Observer) ==========
const fadeElements = document.querySelectorAll('.split-text, .split-img, .bento-card, .testimonial-card');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

fadeElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ========== 3. CARROUSEL AUTOMATIQUE DES PRODUITS ==========
const products = [
    { name: "Baguette tradition", desc: "Farine française, croustillante", price: "650 FCFA", img: "https://images.unsplash.com/photo-1586444248902-2f2e6a0b4e61?w=300" },
    { name: "Croissant pur beurre", desc: "Feuilleté maison", price: "850 FCFA", img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300" },
    { name: "Pain au chocolat", desc: "Chocolat belge", price: "900 FCFA", img: "https://images.unsplash.com/photo-1623334044303-2410211484b0?w=300" },
    { name: "Camembert au four", desc: "Fromage AOP", price: "2500 FCFA", img: "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=300" },
    { name: "Jus de fruits frais", desc: "Ananas / gingembre", price: "1200 FCFA", img: "https://images.unsplash.com/photo-1600271886742-f2acad0f20cd?w=300" }
];

const track = document.getElementById('carouselTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotsContainer = document.getElementById('carouselDots');
let currentIndex = 0;
let autoInterval;

function buildCarousel() {
    track.innerHTML = '';
    products.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${prod.img}" alt="${prod.name}" loading="lazy">
            <div class="product-info">
                <h4>${prod.name}</h4>
                <p>${prod.desc}</p>
                <div class="price">${prod.price}</div>
            </div>
        `;
        track.appendChild(card);
    });
    updateDots();
    updateCarousel();
}

function updateCarousel() {
    const cardWidth = document.querySelector('.product-card')?.offsetWidth + 30 || 315;
    track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    document.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
    });
}

function updateDots() {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < products.length; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i === currentIndex) dot.classList.add('active');
        dot.addEventListener('click', () => {
            clearInterval(autoInterval);
            currentIndex = i;
            updateCarousel();
            startAutoSlide();
        });
        dotsContainer.appendChild(dot);
    }
}

function nextSlide() {
    currentIndex = (currentIndex + 1) % products.length;
    updateCarousel();
}
function prevSlide() {
    currentIndex = (currentIndex - 1 + products.length) % products.length;
    updateCarousel();
}
function startAutoSlide() {
    if (autoInterval) clearInterval(autoInterval);
    autoInterval = setInterval(() => {
        nextSlide();
    }, 4000);
}

prevBtn.addEventListener('click', () => { clearInterval(autoInterval); prevSlide(); startAutoSlide(); });
nextBtn.addEventListener('click', () => { clearInterval(autoInterval); nextSlide(); startAutoSlide(); });
buildCarousel();
startAutoSlide();
window.addEventListener('resize', () => updateCarousel());

// ========== 4. COMPTEURS ANIMÉS ==========
const counters = document.querySelectorAll('.counter-number');
const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-target'));
            let current = 0;
            const increment = target / 80;
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    el.innerText = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    el.innerText = target;
                }
            };
            updateCounter();
            countObserver.unobserve(el);
        }
    });
}, { threshold: 0.5 });
counters.forEach(counter => countObserver.observe(counter));

// ========== 5. FORMULAIRE DE RÉSERVATION ==========
const reservationForm = document.getElementById('reservationForm');
const formMessage = document.getElementById('formMessage');
reservationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nom = document.getElementById('nom').value.trim();
    const telephone = document.getElementById('telephone').value.trim();
    const date = document.getElementById('date').value;
    const heure = document.getElementById('heure').value;
    const personnes = document.getElementById('personnes').value;
    if (!nom || !telephone || !date || !heure) {
        formMessage.style.color = 'red';
        formMessage.innerText = 'Veuillez remplir tous les champs obligatoires.';
        return;
    }
    formMessage.style.color = 'green';
    formMessage.innerHTML = `✅ Merci ${nom}, votre réservation pour ${personnes} personne(s) le ${date} à ${heure} a bien été envoyée. Nous vous contacterons sous 24h.`;
    reservationForm.reset();
});

// ========== 6. FAQ ACCORDÉON ==========
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        item.classList.toggle('active');
        const icon = question.querySelector('i');
        icon.style.transform = item.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0)';
    });
});

// ========== 7. BOUTON RETOUR EN HAUT ==========
const backBtn = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        backBtn.classList.add('show');
    } else {
        backBtn.classList.remove('show');
    }
});
backBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ========== 8. NAVBAR TRANSPARENCE (optionnel) + LIEN WHATSAPP DÉJÀ PRÉSENT ==========
console.log("Paris Baguettes — Site prêt pour Abidjan, Cocody");
