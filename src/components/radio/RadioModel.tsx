"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { RoundedBox, useTexture } from "@react-three/drei";
import { dialScale, grilleCloth, ILC_DIAL_POS, walnut } from "./textures";

// A 1950s tabletop valve radio, built in code. Units: about 1 = 10 cm. Origin at the base centre.
const W = 3.4;
const H = 2.1;
const D = 1.3;
const BEVEL = 0.06;
export const FRONT = D / 2 + BEVEL; // z of the front face

export const GRILLE = { x: -0.55, y: 0.98, w: 1.9, h: 1.22 };
const DIAL = { x: 1.0, y: 1.27, w: 1.12, h: 0.44 };
const DIAL_PAD = 56 / 1024; // scale inset printed on the dial texture
const NEEDLE_REST = 0.06;

function roundedRect(w: number, h: number, rTop: number, rBottom: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  s.moveTo(x + rBottom, 0);
  s.lineTo(x + w - rBottom, 0);
  s.quadraticCurveTo(x + w, 0, x + w, rBottom);
  s.lineTo(x + w, h - rTop);
  s.quadraticCurveTo(x + w, h, x + w - rTop, h);
  s.lineTo(x + rTop, h);
  s.quadraticCurveTo(x, h, x, h - rTop);
  s.lineTo(x, rBottom);
  s.quadraticCurveTo(x, 0, x + rBottom, 0);
  return s;
}

// A frame: rounded rectangle with a rounded-rectangle hole, extruded.
function frameGeometry(w: number, h: number, border: number, r: number, depth: number) {
  const outer = roundedRect(w + border * 2, h + border * 2, r + border, r + border);
  const hole = new THREE.Path(roundedRect(w, h, r, r).getPoints().map((p) => new THREE.Vector2(p.x, p.y + border)));
  outer.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(outer, { depth, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 2, curveSegments: 12 });
  geo.translate(0, -(h + border * 2) / 2, 0);
  return geo;
}

// Knurled knob: a lathe profile whose radius ripples around the circumference.
function knobGeometry() {
  const profile = [
    [0, 0],
    [0.17, 0],
    [0.175, 0.02],
    [0.165, 0.1],
    [0.15, 0.13],
    [0.12, 0.15],
    [0, 0.15],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const geo = new THREE.LatheGeometry(profile, 72);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const r = Math.hypot(v.x, v.z);
    if (r > 0.1 && v.y < 0.11) {
      const a = Math.atan2(v.z, v.x);
      const k = 1 + 0.035 * Math.max(0, Math.cos(a * 30));
      v.x *= k;
      v.z *= k;
      pos.setXYZ(i, v.x, v.y, v.z);
    }
  }
  geo.computeVertexNormals();
  geo.rotateX(Math.PI / 2); // face +z
  return geo;
}

type Props = {
  on: boolean;
  still: boolean;
  dialFont: string;
  onToggle: () => void;
};

export default function RadioModel({ on, still, dialFont, onToggle }: Props) {
  const logo = useTexture("/logo.png", (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
  });

  const tex = useMemo(() => {
    const wood = walnut();
    wood.repeat.set(0.32, 0.5); // one grain tile spans the cabinet, so it never visibly repeats
    return { wood, cloth: grilleCloth(), dial: dialScale(dialFont) };
  }, [dialFont]);

  const geo = useMemo(() => {
    const cabinet = new THREE.ExtrudeGeometry(roundedRect(W, H, 0.6, 0.12), {
      depth: D,
      bevelEnabled: true,
      bevelThickness: BEVEL,
      bevelSize: BEVEL,
      bevelSegments: 5,
      curveSegments: 32,
    });
    cabinet.translate(0, 0, -D / 2);
    return {
      cabinet,
      grilleFrame: frameGeometry(GRILLE.w, GRILLE.h, 0.05, 0.08, 0.04),
      dialBezel: frameGeometry(DIAL.w, DIAL.h, 0.045, 0.06, 0.05),
      knob: knobGeometry(),
    };
  }, []);

  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(tex).forEach((t) => t.dispose());
    },
    [geo, tex],
  );

  const mats = useMemo(
    () => ({
      wood: new THREE.MeshPhysicalMaterial({ map: tex.wood, roughness: 0.5, clearcoat: 0.85, clearcoatRoughness: 0.22 }),
      slat: new THREE.MeshPhysicalMaterial({ color: "#3d1d0f", roughness: 0.55, clearcoat: 0.6, clearcoatRoughness: 0.3 }),
      brass: new THREE.MeshStandardMaterial({ color: "#b98a43", metalness: 1, roughness: 0.3 }),
      chrome: new THREE.MeshStandardMaterial({ color: "#dfe3ea", metalness: 1, roughness: 0.12 }),
      bakelite: new THREE.MeshPhysicalMaterial({ color: "#e6d9bf", roughness: 0.35, clearcoat: 0.6 }),
      feet: new THREE.MeshStandardMaterial({ color: "#1b1410", roughness: 0.6 }),
      cloth: new THREE.MeshStandardMaterial({ map: tex.cloth, roughness: 0.95, emissive: new THREE.Color("#ff9a3c"), emissiveIntensity: 0 }),
      dial: new THREE.MeshStandardMaterial({ map: tex.dial, emissiveMap: tex.dial, emissive: new THREE.Color("#ffb45a"), emissiveIntensity: 0, roughness: 0.6 }),
      glass: new THREE.MeshPhysicalMaterial({ color: "#ffffff", transparent: true, opacity: 0.14, roughness: 0.04, clearcoat: 1, depthWrite: false }),
      needle: new THREE.MeshStandardMaterial({ color: "#c62f25", emissive: new THREE.Color("#c62f25"), emissiveIntensity: 0.2 }),
      eyeGlow: new THREE.MeshStandardMaterial({ color: "#0c2a18", emissive: new THREE.Color("#46ff8c"), emissiveIntensity: 0 }),
      eyeShade: new THREE.MeshBasicMaterial({ color: "#07110b" }),
      badge: new THREE.MeshStandardMaterial({ map: logo, roughness: 0.4 }),
    }),
    [tex, logo],
  );
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);

  const needle = useRef<THREE.Mesh>(null);
  const dialRef = useRef<THREE.Mesh>(null);
  const clothRef = useRef<THREE.Mesh>(null);
  const eyeRef = useRef<THREE.Mesh>(null);
  const tuneKnob = useRef<THREE.Group>(null);
  const eyeWedge = useRef<THREE.Mesh>(null);
  const lampLight = useRef<THREE.PointLight>(null);
  const state = useRef({ lamp: 0, needle: NEEDLE_REST, onAt: -1 });
  const dark = useMemo(() => new THREE.Color("#7d6c58"), []);
  const lit = useMemo(() => new THREE.Color("#ffffff"), []);

  useFrame((frame, delta) => {
    const s = state.current;
    const t = frame.clock.elapsedTime;
    if (on && s.onAt < 0) s.onAt = t;
    if (!on) s.onAt = -1;
    s.lamp = THREE.MathUtils.damp(s.lamp, on ? 1 : 0, on ? 1.6 : 4, delta);
    // valves flicker while they warm up, then settle
    const since = s.onAt < 0 ? 99 : t - s.onAt;
    const flicker = still || since > 1.1 ? 1 : 0.6 + 0.4 * Math.abs(Math.sin(since * 41) * Math.sin(since * 17 + 1));
    const lamp = s.lamp * flicker;
    s.needle = still ? (on ? ILC_DIAL_POS : NEEDLE_REST) : THREE.MathUtils.damp(s.needle, on ? ILC_DIAL_POS : NEEDLE_REST, 1.3, delta);

    // materials are reached through mesh refs: per-frame mutation belongs to three, not React
    const mat = (m: THREE.Mesh | null) => m?.material as THREE.MeshStandardMaterial | undefined;
    const dialMat = mat(dialRef.current);
    if (dialMat) {
      dialMat.emissiveIntensity = lamp * 1.25;
      dialMat.color.copy(dark).lerp(lit, lamp);
    }
    const clothMat = mat(clothRef.current);
    if (clothMat) clothMat.emissiveIntensity = lamp * 0.06;
    const needleMat = mat(needle.current);
    if (needleMat) needleMat.emissiveIntensity = 0.2 + lamp * 0.8;
    const eyeMat = mat(eyeRef.current);
    if (eyeMat) eyeMat.emissiveIntensity = lamp * 0.9;
    if (lampLight.current) lampLight.current.intensity = lamp * 3.2;
    if (needle.current) {
      const inner = DIAL.w * (1 - DIAL_PAD * 2);
      needle.current.position.x = DIAL.x - inner / 2 + s.needle * inner;
    }
    if (tuneKnob.current) tuneKnob.current.rotation.z = -s.needle * 5;
    if (eyeWedge.current) eyeWedge.current.scale.setScalar(1 - lamp * 0.72); // the magic eye closes when tuned
  });

  const pointer = {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      // events come from the whole document: a click on page copy, a link or a button is not a click on the radio
      const target = e.nativeEvent.target as HTMLElement | null;
      if (target?.closest("a, button, p, h1, h2, li, dl")) return;
      onToggle();
    },
    onPointerOver: () => (document.body.style.cursor = "pointer"),
    onPointerOut: () => (document.body.style.cursor = ""),
  };

  const slats = Array.from({ length: 5 }, (_, i) => GRILLE.x - GRILLE.w / 2 + ((i + 1) * GRILLE.w) / 6);

  return (
    <group>
      {/* cabinet sits on its feet */}
      <group position={[0, 0.08, 0]}>
        <mesh geometry={geo.cabinet} material={mats.wood} castShadow name="cabinet" />

        {/* speaker grille: cloth, slats, brass frame */}
        <mesh ref={clothRef} position={[GRILLE.x, GRILLE.y, FRONT + 0.004]} material={mats.cloth}>
          <planeGeometry args={[GRILLE.w, GRILLE.h]} />
        </mesh>
        {slats.map((x) => (
          <RoundedBox key={x} args={[0.042, GRILLE.h, 0.05]} radius={0.02} smoothness={2} position={[x, GRILLE.y, FRONT + 0.03]} material={mats.slat} />
        ))}
        <mesh geometry={geo.grilleFrame} position={[GRILLE.x, GRILLE.y, FRONT]} material={mats.brass} />

        {/* tuning dial: backlit scale, glass, chrome bezel, needle */}
        <group {...pointer}>
          <mesh ref={dialRef} position={[DIAL.x, DIAL.y, FRONT + 0.004]} material={mats.dial} name="dialScale">
            <planeGeometry args={[DIAL.w, DIAL.h]} />
          </mesh>
          <mesh ref={needle} position={[DIAL.x, DIAL.y, FRONT + 0.016]} material={mats.needle}>
            <boxGeometry args={[0.012, DIAL.h * 0.92, 0.006]} />
          </mesh>
          <mesh position={[DIAL.x, DIAL.y, FRONT + 0.03]} material={mats.glass}>
            <planeGeometry args={[DIAL.w, DIAL.h]} />
          </mesh>
          <mesh geometry={geo.dialBezel} position={[DIAL.x, DIAL.y, FRONT]} material={mats.chrome} />
        </group>
        <pointLight ref={lampLight} position={[DIAL.x, DIAL.y, FRONT + 0.5]} color="#ffad55" intensity={0} distance={5} decay={1.6} />

        {/* magic-eye tuning valve */}
        <group position={[DIAL.x, 0.84, FRONT + 0.012]}>
          <mesh material={mats.brass} position={[0, 0, -0.006]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.105, 0.105, 0.02, 40]} />
          </mesh>
          <mesh ref={eyeRef} material={mats.eyeGlow} position={[0, 0, 0.006]}>
            <circleGeometry args={[0.085, 40]} />
          </mesh>
          <mesh ref={eyeWedge} material={mats.eyeShade} position={[0, 0, 0.008]} rotation={[0, 0, Math.PI / 2 - 0.6]}>
            <circleGeometry args={[0.086, 24, 0, 1.2]} />
          </mesh>
        </group>

        {/* knobs: volume (left) and tuning (right) */}
        {[0.66, 1.34].map((x, i) => (
          <group key={x} position={[x, 0.5, FRONT]} ref={i === 1 ? tuneKnob : undefined} {...pointer}>
            <mesh geometry={geo.knob} material={mats.bakelite} castShadow />
            <mesh material={mats.brass} position={[0, 0, 0.152]}>
              <circleGeometry args={[0.1, 36]} />
            </mesh>
            <mesh material={mats.needle} position={[0, 0.06, 0.155]}>
              <boxGeometry args={[0.014, 0.07, 0.004]} />
            </mesh>
          </group>
        ))}

        {/* brass badge carrying the station logo */}
        <group position={[0, 1.83, FRONT]}>
          <RoundedBox args={[0.66, 0.3, 0.03]} radius={0.04} smoothness={3} material={mats.brass} position={[0, 0, 0.012]} />
          <mesh position={[0, 0, 0.03]} material={mats.badge}>
            <planeGeometry args={[0.56, 0.56 * (282 / 540)]} />
          </mesh>
        </group>

        {/* chrome trim along the base */}
        <mesh position={[0, 0.16, FRONT + 0.012]} material={mats.chrome}>
          <boxGeometry args={[W - 0.3, 0.035, 0.025]} />
        </mesh>

        {/* telescopic antenna, leaning back and to the right */}
        <group position={[1.15, H - 0.12, -0.45]} rotation={[-0.25, 0, -0.42]}>
          {[
            [0.03, 0.55],
            [0.021, 0.5],
            [0.014, 0.45],
          ].reduce<{ y: number; els: React.ReactNode[] }>(
            (acc, [r, len], i) => {
              acc.els.push(
                <mesh key={i} position={[0, acc.y + len / 2, 0]} material={mats.chrome}>
                  <cylinderGeometry args={[r, r, len, 16]} />
                </mesh>,
              );
              acc.y += len - 0.04;
              return acc;
            },
            { y: 0, els: [] },
          ).els}
          <mesh position={[0, 1.38, 0]} material={mats.chrome}>
            <sphereGeometry args={[0.035, 16, 12]} />
          </mesh>
        </group>
      </group>

      {/* bakelite feet */}
      {[-1.35, 1.35].flatMap((x) =>
        [-0.42, 0.42].map((z) => (
          <RoundedBox key={`${x}${z}`} args={[0.34, 0.1, 0.26]} radius={0.035} smoothness={2} position={[x, 0.05, z]} material={mats.feet} />
        )),
      )}
    </group>
  );
}
