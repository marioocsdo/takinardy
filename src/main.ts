import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Site {
  id: string;
  n: string;
  lat: number;
  lon: number;
  main?: number;
  mat: number[];
  w: string[];
}

const COLORS = [
  "#1f4e8c",
  "#5b8bc4",
  "#8a9bb0",
  "#b7791f",
  "#2f7d6b",
  "#6b4f8f",
  "#a4372f",
];
const MATS = [
  "Focos LED",
  "Truss 3 m",
  "Tarimas 2x1",
  "Altavoces line array",
  "Bobinas de cable",
  "Vallas de obra",
  "Carpas",
];
const sites: Site[] = [
  {
    id: "nave",
    n: "Nave principal",
    lat: 37.2659459,
    lon: -3.6374944,
    main: 1,
    mat: [40, 60, 120, 24, 80, 150, 6],
    w: ["Pedro Ruiz", "Marta León"],
  },
  {
    id: "sev",
    n: "Concierto Sevilla",
    lat: 37.39,
    lon: -5.98,
    mat: [12, 20, 40, 8, 15, 30, 2],
    w: ["Luis Gil", "Iván Mora", "Sara Cano", "Dani Pons"],
  },
  {
    id: "bcn",
    n: "Festival Barcelona",
    lat: 41.39,
    lon: 2.17,
    mat: [30, 44, 90, 16, 40, 60, 4],
    w: ["Andrés Vela", "Rocío Sanz", "Hugo Bel", "Nuria Coll", "Toni Ferrer"],
  },
  {
    id: "vlc",
    n: "Feria Valencia",
    lat: 39.47,
    lon: -0.38,
    mat: [8, 12, 30, 0, 10, 80, 3],
    w: ["Jorge Tena", "Alba Roca", "Pau Mas"],
  },
  {
    id: "bio",
    n: "Concierto Bilbao",
    lat: 43.26,
    lon: -2.93,
    mat: [14, 18, 36, 10, 20, 25, 0],
    w: ["Iker Uribe", "Leire Goi", "Mikel Sáez"],
  },
  {
    id: "mlg",
    n: "Escenario Málaga",
    lat: 36.72,
    lon: -4.42,
    mat: [6, 10, 20, 4, 8, 12, 1],
    w: ["Carlos Nieto", "Elena Ortiz"],
  },
];
const NAMES = [
  "Pedro Ruiz",
  "Marta León",
  "Luis Gil",
  "Iván Mora",
  "Sara Cano",
  "Dani Pons",
  "Andrés Vela",
  "Rocío Sanz",
  "Hugo Bel",
  "Nuria Coll",
  "Toni Ferrer",
  "Jorge Tena",
  "Alba Roca",
  "Pau Mas",
  "Iker Uribe",
];
let days: Record<string, number> = {};
NAMES.forEach(
  (n, i) => (days[n] = [12, 11, 9, 10, 8, 7, 13, 6, 9, 5, 8, 7, 4, 6, 10][i]),
);
let cargo: number[] = MATS.map(() => 0);
try {
  const s = JSON.parse(localStorage.getItem("esc-days") || "null");
  if (s) days = Object.assign(days, s);
} catch (e) {}

const $ = <T extends Element = HTMLElement>(id: string) =>
  document.getElementById(id) as unknown as T;
let toastTimer: number;
const toast = (t: string) => {
  const e = $("toast");
  e.textContent = t;
  e.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => e.classList.remove("show"), 1800);
};
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
function renderKpis() {
  $("k1").textContent = String(sites.filter((s) => !s.main).length);
  $("k2").textContent = String(sum(sites[0].mat));
  $("k3").textContent = String(sum(Object.values(days)));
}

/* carga inicial */
setTimeout(() => $("loader").classList.add("done"), 2400);
const hoy = new Date();
$("fecha").textContent = hoy.toLocaleDateString("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
$("mes").textContent =
  hoy.toLocaleDateString("es-ES", { month: "long", year: "numeric" }) +
  " · suma o resta días con los botones";

/* mapa OpenStreetMap (Leaflet) */
const map = L.map("map").setView([40.2, -3.7], 6);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);
const bounds = L.latLngBounds(
  sites.map((s) => [s.lat, s.lon] as [number, number]),
);
const fit = () => map.fitBounds(bounds, { padding: [50, 50] });
fit();
const drawer = $("drawer");
L.DomEvent.disableClickPropagation(drawer);
L.DomEvent.disableScrollPropagation(drawer);
sites.forEach((s) => {
  const icon = L.divIcon({
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 28],
    html: `<div class="pin${s.main ? " main" : ""}"><i></i><span>${s.n}</span></div>`,
  });
  L.marker([s.lat, s.lon], { icon, title: s.n })
    .addTo(map)
    .on("click", () => openSite(s));
});
function openSite(s: Site) {
  drawer.innerHTML = `<button class="x" aria-label="Cerrar">✕</button><h2>${s.n}</h2>
  <h3>Trabajadores (${s.w.length})</h3><ul class="lst">${s.w.map((w) => `<li>${w}</li>`).join("") || '<li class="empty">Sin personal asignado</li>'}</ul>
  <h3>Material</h3><ul class="lst">${MATS.map((m, i) => (s.mat[i] ? `<li>${m}<b>${s.mat[i]}</b></li>` : "")).join("") || '<li class="empty">Sin material</li>'}</ul>`;
  drawer.classList.add("open");
  drawer.querySelector<HTMLButtonElement>(".x")!.onclick = () =>
    drawer.classList.remove("open");
}
$("zres").onclick = fit;
$("zbig").onclick = () => {
  const big = $("mapSec").classList.toggle("big");
  $("zbig").textContent = big ? "Reducir mapa" : "Ampliar mapa";
  setTimeout(() => {
    map.invalidateSize();
    fit();
  }, 320);
};

/* camión */
$("wheels").innerHTML = [110, 220, 490, 580]
  .map(
    (x) =>
      `<g transform="translate(${x} 214)"><g class="wheel"><circle r="26" fill="#12233b"/><circle r="11" fill="#8fa0b5" stroke="#f7f9fb" stroke-width="3"/><path d="M0-11V11M-11 0H11" stroke="#12233b" stroke-width="3"/></g></g>`,
  )
  .join("");
const oSel = $<HTMLSelectElement>("orig"),
  dSel = $<HTMLSelectElement>("dest");
sites.forEach((s) => {
  oSel.add(new Option(s.n, s.id));
  dSel.add(new Option(s.n, s.id));
});
dSel.value = "sev";
const site = (id: string) => sites.find((s) => s.id === id)!;
function renderStock() {
  const s = site(oSel.value);
  $("stock").innerHTML = MATS.map(
    (m, i) =>
      `<li class="item"><span class="chip" style="background:${COLORS[i]}"></span><span>${m}</span><b>${s.mat[i]}</b><button data-i="${i}" data-n="1" ${s.mat[i] ? "" : "disabled"} aria-label="Cargar 1 ${m}">+1</button><button data-i="${i}" data-n="10" ${s.mat[i] ? "" : "disabled"} aria-label="Cargar 10 ${m}">+10</button></li>`,
  ).join("");
  renderKpis();
}
function renderCargo() {
  const tot = sum(cargo);
  $("cargoList").innerHTML =
    MATS.map((m, i) =>
      cargo[i] ? `<li>${m}<b>${cargo[i]}</b></li>` : "",
    ).join("") || '<li class="empty">Vacío</li>';
  $("hint").textContent = tot ? `${tot} unidades cargadas` : "Camión vacío";
  const boxes: number[] = [];
  MATS.forEach((_, i) => {
    const n = Math.min(cargo[i] ? Math.ceil(cargo[i] / 6) : 0, 8);
    for (let k = 0; k < n; k++) boxes.push(i);
  });
  $("cargo").innerHTML = boxes
    .slice(0, 24)
    .map((c, k) => {
      const col = k % 8,
        row = Math.floor(k / 8);
      return `<rect x="${24 + col * 46}" y="${142 - row * 34}" width="42" height="30" rx="2" fill="${COLORS[c]}" stroke="#12233b" stroke-width="3"/>`;
    })
    .join("");
}
$("stock").addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest("button");
  if (!b) return;
  const s = site(oSel.value),
    i = +b.dataset.i!,
    n = Math.min(+b.dataset.n!, s.mat[i]);
  s.mat[i] -= n;
  cargo[i] += n;
  renderStock();
  renderCargo();
  const t = $<SVGSVGElement>("truck");
  t.classList.remove("squash");
  void t.getBoundingClientRect();
  t.classList.add("squash");
});
oSel.onchange = renderStock;
const openLoad = () => {
  oSel.value = "nave";
  renderStock();
  $("loadPanel").scrollIntoView({ behavior: "smooth", block: "nearest" });
};
$<SVGSVGElement>("truck").onclick = openLoad;
$<SVGSVGElement>("truck").onkeydown = (e) => {
  if (e.key === "Enter" || e.key === " ") openLoad();
};
$("clear").onclick = () => {
  const s = site(oSel.value);
  cargo.forEach((n, i) => (s.mat[i] += n));
  cargo = MATS.map(() => 0);
  renderStock();
  renderCargo();
};
$("send").onclick = () => {
  if (!sum(cargo)) {
    toast("Carga material antes de enviar");
    return;
  }
  const d = site(dSel.value),
    t = $<SVGSVGElement>("truck");
  t.classList.add("go");
  setTimeout(() => {
    cargo.forEach((n, i) => (d.mat[i] += n));
    cargo = MATS.map(() => 0);
    t.classList.remove("go");
    renderCargo();
    renderStock();
    toast(`Entregado en ${d.n}`);
  }, 2200);
};
renderStock();
renderCargo();

/* personal */
function renderW() {
  $("workers").innerHTML = NAMES.map(
    (n) =>
      `<div class="w"><span class="n">${n}</span><button class="m" data-n="${n}" data-d="-1" aria-label="Restar día a ${n}">−</button><span class="d">${days[n]}</span><button data-n="${n}" data-d="1" aria-label="Sumar día a ${n}">+</button></div>`,
  ).join("");
  $("total").textContent =
    "Total del mes: " + sum(Object.values(days)) + " jornadas";
  renderKpis();
}
$("workers").addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest("button");
  if (!b) return;
  days[b.dataset.n!] = Math.max(
    0,
    Math.min(31, days[b.dataset.n!] + +b.dataset.d!),
  );
  try {
    localStorage.setItem("esc-days", JSON.stringify(days));
  } catch (_) {}
  renderW();
});
renderW();
