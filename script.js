// Destino del formulario: FormSubmit reenvía cada solicitud al correo de Würfel.
// La primera vez llega un correo de activación a wurfel.cl@gmail.com que hay que confirmar.
const FORM_ENDPOINT = "https://formsubmit.co/ajax/wurfel.cl@gmail.com";
const CONTACT_EMAIL = "wurfel.cl@gmail.com";

document.getElementById("year").textContent = new Date().getFullYear();

// ---------- Header y menú móvil ----------
const header = document.querySelector(".site-header");
const toggle = document.querySelector(".menu-toggle");
const nav = document.getElementById("nav");

const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 12);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("open");
  toggle.setAttribute("aria-expanded", "false");
}));

// ---------- Aparición al hacer scroll ----------
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  revealEls.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 3) * 70}ms`;
    io.observe(el);
  });
} else {
  revealEls.forEach(el => el.classList.add("in"));
}

// ---------- Luz que sigue al cursor en las tarjetas ----------
document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("pointermove", e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
});

// ---------- Log de workflow simulado ----------
const log = document.getElementById("log");
const runs = [
  [["trigger", "cron diario 09:00"], ["sii", "42 documentos nuevos"], ["ia", "clasifica por centro de costo"], ["drive", "PDF + XML archivados"], ["ok", "reporte enviado a finanzas"]],
  [["webhook", "nueva solicitud de compra"], ["ia", "extrae ítems y urgencia"], ["erp", "valida presupuesto"], ["whatsapp", "aviso al aprobador"], ["ok", "solicitud registrada"]],
  [["gmail", "3 correos de proveedores"], ["ia", "lee y resume adjuntos"], ["sheets", "actualiza control"], ["slack", "alerta: 1 vencimiento"], ["ok", "bandeja procesada"]],
];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let run = 0, step = 0, clock = 9 * 3600;

function stamp() {
  clock += 1 + Math.floor(Math.random() * 4);
  const h = String(Math.floor(clock / 3600) % 24).padStart(2, "0");
  const m = String(Math.floor(clock / 60) % 60).padStart(2, "0");
  const s = String(clock % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function addLine(k, m) {
  const li = document.createElement("li");
  if (k === "ok") li.className = "done";
  li.innerHTML = `<span class="t">${stamp()}</span><span class="k">${k === "ok" ? "✓ listo" : "▸ " + k}</span><span class="m"></span>`;
  li.querySelector(".m").textContent = m;
  log.appendChild(li);
  while (log.children.length > 5) log.firstElementChild.remove();
}

function tick() {
  addLine(...runs[run][step]);
  step++;
  if (step >= runs[run].length) { step = 0; run = (run + 1) % runs.length; clock += 600; setTimeout(tick, 2600); }
  else setTimeout(tick, 900);
}
if (log) {
  if (reduceMotion) runs[0].forEach(line => addLine(...line));
  else tick();
}

// ---------- Formulario de contacto ----------
const form = document.getElementById("contact-form");
const statusEl = document.getElementById("form-status");
const submitBtn = form.querySelector("button[type=submit]");
const btnLabel = submitBtn.querySelector(".btn-label");

function setInvalid(el, bad) { el.classList.toggle("invalid", bad); return bad; }

function validate() {
  let bad = false;
  form.querySelectorAll("input[required]:not([type=checkbox]), textarea[required]").forEach(input => {
    const empty = !input.value.trim();
    const wrongMail = input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
    bad = setInvalid(input.closest(".field"), empty || wrongMail) || bad;
  });
  const services = form.querySelectorAll("input[name=servicio]:checked").length;
  bad = setInvalid(form.querySelector(".options").closest(".field"), services === 0) || bad;
  bad = setInvalid(form.querySelector(".consent"), !form.consentimiento.checked) || bad;
  return !bad;
}

form.addEventListener("input", e => {
  const holder = e.target.closest(".field, .consent");
  if (holder && holder.classList.contains("invalid")) validate();
});

form.addEventListener("submit", async e => {
  e.preventDefault();
  statusEl.className = "form-status";
  statusEl.textContent = "";
  if (!validate()) {
    statusEl.classList.add("err");
    statusEl.textContent = "Revisa los campos marcados en rojo.";
    form.querySelector(".invalid input, .invalid textarea")?.focus();
    return;
  }
  if (form._honey.value) return; // bot

  const fd = new FormData(form);
  const payload = {
    _subject: `Nueva solicitud Würfel — ${fd.get("empresa")}`,
    _template: "table",
    _captcha: "false",
    _replyto: fd.get("email"),
    Nombre: fd.get("nombre"),
    Empresa: fd.get("empresa"),
    Cargo: fd.get("cargo") || "—",
    Correo: fd.get("email"),
    Telefono: fd.get("telefono") || "—",
    "Tamaño empresa": fd.get("tamano") || "—",
    Servicios: fd.getAll("servicio").join(", "),
    "Sistemas actuales": fd.get("sistemas") || "—",
    Plazo: fd.get("plazo") || "—",
    Mensaje: fd.get("mensaje"),
  };

  submitBtn.disabled = true;
  btnLabel.textContent = "Enviando…";
  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || String(data.success) === "false") throw new Error(data.message || res.statusText);
    form.classList.add("sent");
    form.innerHTML = `
      <div class="sent-icon"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
      <h3>Solicitud recibida</h3>
      <p>Gracias, ${escapeHtml(payload.Nombre.split(" ")[0])}. Revisaré tu caso y te responderé dentro de 1 día hábil a <strong>${escapeHtml(payload.Correo)}</strong>.</p>`;
  } catch (err) {
    submitBtn.disabled = false;
    btnLabel.textContent = "Enviar solicitud";
    statusEl.classList.add("err");
    const body = encodeURIComponent(Object.entries(payload).filter(([k]) => !k.startsWith("_")).map(([k, v]) => `${k}: ${v}`).join("\n"));
    statusEl.innerHTML = `No pudimos enviar el formulario. Escríbenos directo a <a href="mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(payload._subject)}&body=${body}">${CONTACT_EMAIL}</a>.`;
  }
});

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
