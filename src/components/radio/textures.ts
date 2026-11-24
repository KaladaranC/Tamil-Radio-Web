import * as THREE from "three";

// Procedural canvas textures for the radio. Client-only (needs document).
// Seeded random keeps every texture identical across renders and visits.

function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

function finish(c: HTMLCanvasElement, srgb = true, repeat?: [number, number]) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...repeat);
  }
  return t;
}

// Lacquered walnut: long wavy grain lines over a warm base, plus a matching roughness map.
export function walnut() {
  const [c, g] = canvas(1024, 512);
  const r = rng(7);
  g.fillStyle = "#5b2e19";
  g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 420; i++) {
    const y0 = r() * 512;
    const amp = 2 + r() * 9;
    const freq = 0.004 + r() * 0.01;
    const phase = r() * Math.PI * 2;
    const dark = r() < 0.62;
    g.strokeStyle = dark ? `rgba(40,16,6,${0.08 + r() * 0.22})` : `rgba(160,92,50,${0.05 + r() * 0.14})`;
    g.lineWidth = 0.6 + r() * 2.4;
    g.beginPath();
    for (let x = 0; x <= 1024; x += 16) {
      const y = y0 + Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 3.1 + phase) * amp * 0.3;
      if (x === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
  }
  // a few knots, where grain bunches up
  for (let k = 0; k < 3; k++) {
    const kx = 120 + r() * 780;
    const ky = 60 + r() * 390;
    for (let ring = 1; ring < 9; ring++) {
      g.strokeStyle = `rgba(35,14,5,${0.25 - ring * 0.02})`;
      g.lineWidth = 1.2;
      g.beginPath();
      g.ellipse(kx, ky, ring * 7, ring * 2.6, 0, 0, Math.PI * 2);
      g.stroke();
    }
  }
  return finish(c, true, [1, 1]);
}

// Woven speaker cloth: gold weft over dark warp, with a faint diagonal sheen.
export function grilleCloth() {
  const [c, g] = canvas(256, 256);
  g.fillStyle = "#3a2a1a";
  g.fillRect(0, 0, 256, 256);
  const step = 8;
  for (let y = 0; y < 256; y += step) {
    for (let x = 0; x < 256; x += step) {
      const over = ((x + y) / step) % 2 === 0;
      g.fillStyle = over ? "#b8955a" : "#8a6a3c";
      g.fillRect(x + 1, y + 1, step - 2, step - 2);
      g.fillStyle = "rgba(255,230,180,0.12)";
      g.fillRect(x + 1, y + 1, step - 2, 1.5);
    }
  }
  return finish(c, true, [7, 6]);
}

// Diaspora cities on the dial, roughly where Tamil listeners are.
const CITIES: [string, number][] = [
  ["COLOMBO", 0.08],
  ["JAFFNA", 0.2],
  ["CHENNAI", 0.32],
  ["SINGAPORE", 0.44],
  ["PARIS", 0.56],
  ["TORONTO", 0.68],
  ["LONDON", 0.92],
];
export const ILC_DIAL_POS = 0.8; // where the needle stops: 0..1 across the scale

// Backlit dial glass: parchment, two frequency bands, city names, ILC marked in red.
export function dialScale(fontFamily: string) {
  const W = 1024;
  const H = 400;
  const [c, g] = canvas(W, H);
  const grad = g.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#f6e9c8");
  grad.addColorStop(1, "#e9d3a2");
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);
  const pad = 56;
  const span = W - pad * 2;
  const xAt = (p: number) => pad + p * span;
  const ink = "#3b2a1c";

  g.textAlign = "center";
  g.textBaseline = "middle";

  // Medium wave band
  g.strokeStyle = ink;
  g.fillStyle = ink;
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(pad, 92);
  g.lineTo(W - pad, 92);
  g.stroke();
  const mw = [530, 600, 700, 800, 1000, 1200, 1400, 1600];
  for (let i = 0; i <= 70; i++) {
    const x = xAt(i / 70);
    const major = i % 10 === 0;
    g.lineWidth = major ? 2.5 : 1.2;
    g.beginPath();
    g.moveTo(x, 92);
    g.lineTo(x, major ? 70 : 82);
    g.stroke();
  }
  g.font = `600 26px ${fontFamily}`;
  mw.forEach((f, i) => g.fillText(String(f), xAt(i / (mw.length - 1)), 44));
  g.font = `700 22px ${fontFamily}`;
  g.fillText("MW", 28, 92);

  // Short wave band
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(pad, 300);
  g.lineTo(W - pad, 300);
  g.stroke();
  const sw = [6, 7, 9, 11, 13, 15, 17, 21];
  for (let i = 0; i <= 56; i++) {
    const x = xAt(i / 56);
    const major = i % 8 === 0;
    g.lineWidth = major ? 2.5 : 1.2;
    g.beginPath();
    g.moveTo(x, 300);
    g.lineTo(x, major ? 322 : 310);
    g.stroke();
  }
  g.font = `600 24px ${fontFamily}`;
  sw.forEach((f, i) => g.fillText(String(f), xAt(i / (sw.length - 1)), 350));
  g.font = `700 22px ${fontFamily}`;
  g.fillText("SW", 28, 300);

  // City names, staggered on two rows so they never collide
  CITIES.forEach(([name, p], i) => {
    const x = xAt(p);
    const y = i % 2 ? 230 : 160;
    g.font = `500 21px ${fontFamily}`;
    g.fillStyle = ink;
    g.fillText(name, x, y);
    g.beginPath();
    g.lineWidth = 1;
    g.moveTo(x, y + (i % 2 ? -18 : 16));
    g.lineTo(x, i % 2 ? 196 : 196);
    g.stroke();
  });

  // ILC: the station this radio is tuned to
  const ix = xAt(ILC_DIAL_POS);
  g.fillStyle = "#c62f25";
  g.beginPath();
  g.arc(ix, 196, 9, 0, Math.PI * 2);
  g.fill();
  g.font = `800 30px ${fontFamily}`;
  g.fillText("ILC", ix, 160);

  return finish(c);
}

// Hand-crocheted doily: rings of picots and petals, scalloped edge. Alpha carries the lace.
export function doily() {
  const S = 1024;
  const [c, g] = canvas(S, S);
  const cx = S / 2;
  g.clearRect(0, 0, S, S);
  g.strokeStyle = "#f3ecdf";
  g.fillStyle = "#f3ecdf";

  // centre flower
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    g.beginPath();
    g.ellipse(cx + Math.cos(a) * 44, cx + Math.sin(a) * 44, 34, 13, a, 0, Math.PI * 2);
    g.lineWidth = 5;
    g.stroke();
  }
  // concentric rings of chain loops
  const rings = [110, 170, 235, 300, 365, 425];
  rings.forEach((R, ri) => {
    g.lineWidth = 4;
    g.beginPath();
    g.arc(cx, cx, R, 0, Math.PI * 2);
    g.stroke();
    const n = 18 + ri * 8;
    for (let i = 0; i < n; i++) {
      const a = ((i + (ri % 2) * 0.5) / n) * Math.PI * 2;
      const r2 = R + 30;
      g.beginPath();
      g.arc(cx + Math.cos(a) * r2, cx + Math.sin(a) * r2, ri % 2 ? 11 : 15, 0, Math.PI * 2);
      g.lineWidth = 3.5;
      g.stroke();
      if (ri % 2 === 0) {
        g.beginPath();
        g.moveTo(cx + Math.cos(a) * R, cx + Math.sin(a) * R);
        g.lineTo(cx + Math.cos(a) * (R + 60), cx + Math.sin(a) * (R + 60));
        g.lineWidth = 2.5;
        g.stroke();
      }
    }
  });
  // scalloped edge
  const n = 64;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    g.beginPath();
    g.arc(cx + Math.cos(a) * 480, cx + Math.sin(a) * 480, 22, a - Math.PI / 2, a + Math.PI / 2);
    g.lineWidth = 6;
    g.stroke();
  }
  return finish(c);
}

// Soft radial falloff, for the table top fading into the dark room.
export function radialFade() {
  const S = 512;
  const [c, g] = canvas(S, S);
  const grad = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  grad.addColorStop(0, "#fff");
  grad.addColorStop(0.45, "#aaa");
  grad.addColorStop(1, "#000");
  g.fillStyle = grad;
  g.fillRect(0, 0, S, S);
  return finish(c, false);
}
