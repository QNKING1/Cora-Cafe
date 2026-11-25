// === Easy client customization ===
const CAFE_NAME = "Cora Cafe";
const WHATSAPP_NUMBER = "923083455811"; // Pakistan number in international format, digits only
const TOTAL_FRAMES = 210;
const FRAME_PATH = "./frames/frame_";
const FRAME_EXTENSION = ".webp";
// =================================

const menuItems = [
  {name:"Velvet Cortado", price:"PKR 220", category:"espresso", badge:"Espresso Bar", description:"Double ristretto, silky textured milk, and a caramel finish.", image:"https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=900&q=85"},
  {name:"Honey Flat White", price:"PKR 260", category:"espresso", badge:"Espresso Bar", description:"Espresso, local honey, and a soft cloud of microfoam.", image:"https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=900&q=85"},
  {name:"Orange Cold Brew", price:"PKR 280", category:"cold", badge:"Iced & Cold Brew", description:"Eighteen-hour cold brew, orange peel, tonic, and ice.", image:"https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=85"},
  {name:"Cloud Iced Latte", price:"PKR 290", category:"cold", badge:"Iced & Cold Brew", description:"Double shot, oat milk, vanilla cream, and cacao dust.", image:"https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=85"},
  {name:"Brown Butter Croissant", price:"PKR 190", category:"bakery", badge:"Artisan Bakery", description:"Flaky, golden layers finished with brown butter glaze.", image:"https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=85"},
  {name:"Pistachio Morning Bun", price:"PKR 210", category:"bakery", badge:"Artisan Bakery", description:"A crisp cinnamon spiral with pistachio and citrus sugar.", image:"https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=900&q=85"},
  {name:"Garden Poached Eggs", price:"PKR 420", category:"brunch", badge:"All-Day Brunch", description:"Sourdough, soft eggs, greens, feta, and herb oil.", image:"https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=85"},
  {name:"Whipped Ricotta Toast", price:"PKR 380", category:"brunch", badge:"All-Day Brunch", description:"Sourdough, whipped ricotta, roasted tomatoes, and basil.", image:"https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85"},
  {name:"Cinnamon Bun French Toast", price:"PKR 390", category:"brunch", badge:"All-Day Brunch", description:"Brioche, cinnamon custard, maple, and toasted pecans.", image:"https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=900&q=85"}
];

const frameUrl = index => `${FRAME_PATH}${String(index).padStart(4,"0")}${FRAME_EXTENSION}`;
const canvas = document.getElementById("brewCanvas");
const ctx = canvas.getContext("2d", {alpha:false});
const frameCache = [];
let currentFrame = 1;

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(canvas.clientWidth * dpr);
  canvas.height = Math.round(canvas.clientHeight * dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  drawFrame(currentFrame);
}

function drawFrame(index) {
  currentFrame = index;
  const image = frameCache[index - 1];
  if (!image?.complete) return;
  const cw = canvas.clientWidth;
  const ch = canvas.clientHeight;
  const scale = Math.max(cw / image.naturalWidth, ch / image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  ctx.drawImage(image, (cw-width)/2, (ch-height)/2, width, height);
}

function loadFrame(index) {
  return new Promise(resolve => {
    const image = new Image();
    image.onload = () => { frameCache[index-1] = image; resolve(image); };
    image.onerror = () => resolve(null);
    image.src = frameUrl(index);
  });
}

async function initFrames() {
  const first = await loadFrame(1);
  if (first) drawFrame(1);
  resizeCanvas();
  if (typeof gsap !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    const brew = {frame:1};
    gsap.to(brew, {
      frame:TOTAL_FRAMES,
      ease:"none",
      scrollTrigger:{
        trigger:"#top",
        start:"top top",
        end:"+=180%",
        scrub:0.8,
        pin:true
      },
      onUpdate(){
        const index = Math.min(TOTAL_FRAMES, Math.max(1, Math.round(brew.frame)));
        drawFrame(index);
        document.getElementById("brewProgress").style.width = `${((index-1)/(TOTAL_FRAMES-1))*100}%`;
        const step = index < 70 ? "01 / Velvety Micro-Foam" : index < 140 ? "02 / Single-Origin Espresso Pour" : "03 / Golden Crema Finish";
        document.getElementById("brewStep").textContent = step;
      }
    });
  }
  // Preload remaining frames in small chunks to keep the page responsive.
  for (let start=2; start<=TOTAL_FRAMES; start+=12) {
    const chunk = [];
    for (let i=start; i<Math.min(start+12,TOTAL_FRAMES+1); i++) chunk.push(loadFrame(i));
    await Promise.all(chunk);
  }
}

function renderMenu() {
  const grid = document.getElementById("menuGrid");
  grid.innerHTML = menuItems.map(item => `
    <article class="menu-card" data-category="${item.category}">
      <div class="menu-image">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
        <span class="category-badge">${item.badge}</span>
      </div>
      <div class="menu-details">
        <div class="menu-title-row"><h3>${item.name}</h3><span class="price">${item.price}</span></div>
        <p>${item.description}</p>
        <button class="order-item" type="button" data-name="${item.name}" data-price="${item.price}">Order on WhatsApp ↗</button>
      </div>
    </article>
  `).join("");

  document.querySelectorAll(".order-item").forEach(button => {
    button.addEventListener("click", () => {
      const text = `Hello ${CAFE_NAME}! I’d like to order ${button.dataset.name} (${button.dataset.price}).`;
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    });
  });
}

document.querySelectorAll(".menu-tabs button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".menu-tabs button").forEach(tab => {
      tab.classList.remove("active");
      tab.setAttribute("aria-selected","false");
    });
    button.classList.add("active");
    button.setAttribute("aria-selected","true");
    const filter = button.dataset.filter;
    document.querySelectorAll(".menu-card").forEach(card => {
      card.classList.toggle("hidden", filter !== "all" && card.dataset.category !== filter);
    });
  });
});

document.querySelectorAll("[data-whatsapp-general]").forEach(link => {
  link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello ${CAFE_NAME}! I’d like to place an order.`)}`;
  link.target = "_blank";
  link.rel = "noopener";
});

const nav = document.querySelector(".pill-nav");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
});
navLinks.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  navLinks.classList.remove("open");
  navToggle.setAttribute("aria-expanded","false");
}));

window.addEventListener("scroll", () => nav.classList.toggle("scrolled", window.scrollY > window.innerHeight * .75), {passive:true});
window.addEventListener("resize", () => {
  resizeCanvas();
  if (typeof ScrollTrigger !== "undefined") requestAnimationFrame(() => ScrollTrigger.refresh());
});

if (typeof gsap !== "undefined") {
  gsap.utils.toArray(".reveal").forEach(element => {
    gsap.to(element, {
      opacity:1,
      y:0,
      duration:.8,
      ease:"power2.out",
      scrollTrigger:{trigger:element, start:"top 88%", once:true}
    });
  });
} else {
  document.querySelectorAll(".reveal").forEach(element => { element.style.opacity=1; element.style.transform="none"; });
}

const dateInput = document.querySelector('[name="date"]');
dateInput.value = new Date().toISOString().split("T")[0];
dateInput.min = dateInput.value;

const bookingForm = document.getElementById("bookingForm");
function validateBooking() {
  if (!bookingForm.checkValidity()) {
    bookingForm.reportValidity();
    return false;
  }
  return true;
}
function bookingSummary() {
  const data = new FormData(bookingForm);
  return {
    fullName:data.get("fullName"), phone:data.get("phone"), email:data.get("email") || "Not provided",
    seating:data.get("seating"), date:data.get("date"), time:data.get("time"), guests:data.get("guests"),
    note:data.get("note") || "No special note"
  };
}

document.getElementById("whatsappBooking").addEventListener("click", () => {
  if (!validateBooking()) return;
  const b = bookingSummary();
  const message = `Hello ${CAFE_NAME}! I’d like to reserve a table.\n\nName: ${b.fullName}\nPhone / WhatsApp: ${b.phone}\nEmail: ${b.email}\nSeating: ${b.seating}\nDate: ${b.date}\nTime: ${b.time}\nGuests: ${b.guests}\nSpecial Note: ${b.note}`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
});

const modal = document.getElementById("emailModal");
const emailPreview = document.getElementById("emailPreview");
function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden","true");
  document.body.classList.remove("modal-open");
}
document.querySelector(".modal-close").addEventListener("click", closeModal);
document.querySelector(".modal-done").addEventListener("click", closeModal);
modal.addEventListener("click", event => { if (event.target === modal) closeModal(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") closeModal(); });

document.getElementById("emailBooking").addEventListener("click", event => {
  if (!validateBooking()) return;
  const button = event.currentTarget;
  const label = button.querySelector(".button-label");
  const b = bookingSummary();
  label.textContent = "Dispatching to Owner...";
  button.disabled = true;
  setTimeout(() => {
    emailPreview.innerHTML = `
      <div><small>From</small><span>reservation@coracafe.demo</span></div>
      <div><small>To</small><span>owner@coracafe.com</span></div>
      <div><small>Guest</small><span>${b.fullName}</span></div>
      <div><small>Phone</small><span>${b.phone}</span></div>
      <div><small>Email</small><span>${b.email}</span></div>
      <div><small>Guests</small><span>${b.guests}</span></div>
      <div><small>Date</small><span>${b.date}</span></div>
      <div><small>Time</small><span>${b.time}</span></div>
      <div class="full"><small>Seating preference</small><span>${b.seating}</span></div>
      <div class="full"><small>Special note</small><span>${b.note}</span></div>`;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden","false");
    document.body.classList.add("modal-open");
    label.textContent = "Confirm & Email Owner";
    button.disabled = false;
  },700);
});

document.getElementById("year").textContent = new Date().getFullYear();
renderMenu();
resizeCanvas();
initFrames();
