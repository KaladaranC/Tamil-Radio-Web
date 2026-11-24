"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { FRONT, GRILLE } from "./RadioModel";

// Tamil letters drifting out of the speaker like musical notes while the radio plays.
// Drawn with the page's own Anek Tamil (already loaded), so no font file is fetched.
const LETTERS = [..."அஆஇஈஉஊஎஏஐஒஓகஙசஞடணதநபமயரலவழளறன", "ஔ", "ஃ"];
const POOL = 22;
const CABINET_LIFT = 0.08; // the cabinet stands on its feet

function letterTexture(ch: string, family: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 160;
  const g = c.getContext("2d")!;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = `700 96px ${family}`;
  g.shadowColor = "rgba(242,166,64,0.9)"; // valve amber glow around each letter
  g.shadowBlur = 22;
  g.fillStyle = "#ffe2b0";
  g.fillText(ch, 80, 86);
  g.shadowBlur = 0;
  g.fillText(ch, 80, 86); // second pass keeps the core crisp over its glow
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

type Note = { alive: boolean; age: number; life: number; vel: THREE.Vector3; phase: number; spin: number; size: number };

export default function TamilNotes({ on, still, font }: { on: boolean; still: boolean; font: string }) {
  const textures = useMemo(() => LETTERS.map((ch) => letterTexture(ch, font)), [font]);
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);

  const sprites = useRef<(THREE.Sprite | null)[]>([]);
  const state = useRef({
    notes: Array.from({ length: POOL }, (): Note => ({ alive: false, age: 0, life: 1, vel: new THREE.Vector3(), phase: 0, spin: 0, size: 0.3 })),
    timer: 0,
    warm: 0,
  });

  useFrame((_, delta) => {
    const s = state.current;
    const dt = Math.min(delta, 0.05);
    // let the valves warm up before the first letter leaves the speaker
    s.warm = on ? s.warm + dt : 0;
    s.timer -= dt;
    if (on && s.warm > 1.2 && s.timer <= 0) {
      s.timer = still ? 1.4 : 0.45 + Math.random() * 0.35;
      const i = s.notes.findIndex((n) => !n.alive);
      const sp = sprites.current[i];
      if (i >= 0 && sp) {
        const n = s.notes[i];
        n.alive = true;
        n.age = 0;
        n.life = 3.6 + Math.random() * 1.6;
        n.phase = Math.random() * Math.PI * 2;
        n.spin = (Math.random() - 0.5) * (still ? 0 : 0.8);
        n.size = 0.26 + Math.random() * 0.16;
        const speed = still ? 0.45 : 1;
        n.vel.set((Math.random() - 0.5) * 0.18 * speed, (0.42 + Math.random() * 0.25) * speed, (0.22 + Math.random() * 0.22) * speed);
        sp.position.set(GRILLE.x + (Math.random() - 0.5) * GRILLE.w * 0.7, CABINET_LIFT + GRILLE.y + (Math.random() - 0.5) * GRILLE.h * 0.5, FRONT + 0.06);
        (sp.material as THREE.SpriteMaterial).map = textures[Math.floor(Math.random() * textures.length)];
        (sp.material as THREE.SpriteMaterial).needsUpdate = true;
      }
    }

    s.notes.forEach((n, i) => {
      const sp = sprites.current[i];
      if (!sp) return;
      if (!n.alive) {
        sp.visible = false;
        return;
      }
      n.age += dt;
      const t = n.age / n.life;
      if (t >= 1) {
        n.alive = false;
        sp.visible = false;
        return;
      }
      sp.visible = true;
      sp.position.addScaledVector(n.vel, dt);
      if (!still) sp.position.x += Math.sin(n.age * 2.2 + n.phase) * 0.22 * dt; // a lilting sway, like a melody line
      const m = sp.material as THREE.SpriteMaterial;
      m.rotation += n.spin * dt;
      m.opacity = Math.min(1, n.age / 0.35) * (t > 0.55 ? 1 - (t - 0.55) / 0.45 : 1);
      sp.scale.setScalar(n.size * (0.55 + 0.45 * Math.min(1, n.age / 0.6)));
    });
  });

  return (
    <group>
      {Array.from({ length: POOL }, (_, i) => (
        <sprite
          key={i}
          ref={(el) => {
            sprites.current[i] = el;
          }}
          visible={false}
          raycast={() => null}
        >
          <spriteMaterial transparent depthWrite={false} opacity={0} />
        </sprite>
      ))}
    </group>
  );
}
