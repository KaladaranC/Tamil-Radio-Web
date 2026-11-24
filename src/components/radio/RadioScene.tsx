"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import RadioModel from "./RadioModel";
import TamilNotes from "./TamilNotes";
import { doily, radialFade } from "./textures";
import { useMediaQuery } from "@/lib/useMediaQuery";

type Props = { on: boolean; onToggle: () => void; reducedMotion: boolean };

// One camera stop per screen of the page: 0 the front, 1 the dial, 2 the antenna and the phone line.
// [camera position, look-at point]. Radio stands at the origin, turned -0.38 rad.
type Stop = [[number, number, number], [number, number, number]];
const STOPS_WIDE: Stop[] = [
  [[-3.3, 2.4, 9.0], [-1.2, 1.15, 0]], // radio right of the copy
  // square to the dial's face (dial ≈ (0.67, 1.35, 1.03), facing (-0.37, 0, 0.93)), aimed past it so it sits left; copy on the right
  [[-0.6, 1.6, 4.3], [1.8, 1.25, 1.4]],
  [[-2.4, 4.6, 6.4], [-1.4, 0.7, 0]], // high and back: antenna, top, the whole set on its doily
];
const STOPS_NARROW: Stop[] = [
  [[0, 2.6, 13.8], [0, -0.55, 0]], // the whole set, small, in the top third; copy below
  [[0.7, 1.9, 4.6], [0.55, 0.85, 0.8]],
  [[0.6, 8.4, 15.0], [0.2, -3.0, 0]], // high above and far: the radio small at the very top, the numbers below
];

const smooth = (t: number) => t * t * (3 - 2 * t);

// Dark walnut table top fading into the room, with the lace doily under the radio.
function Table() {
  const t = useMemo(() => ({ fade: radialFade(), lace: doily() }), []);
  useEffect(() => () => Object.values(t).forEach((tx) => tx.dispose()), [t]);
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.002, 0]} receiveShadow>
        <planeGeometry args={[10, 7.5]} />
        <meshStandardMaterial color="#2a1810" roughness={0.55} alphaMap={t.fade} transparent depthWrite={false} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} rotation-z={0.3} position={[0, 0.004, 0.1]}>
        <planeGeometry args={[4.9, 4.9]} />
        <meshStandardMaterial map={t.lace} alphaTest={0.35} roughness={1} color="#efe6d8" />
      </mesh>
    </group>
  );
}

// Dust turning in the lamp light. One draw call.
function Dust({ still, count }: { still: boolean; count: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    let s = 4242;
    const r = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3] = -4 + r() * 8;
      a[i * 3 + 1] = 0.3 + r() * 4.5;
      a[i * 3 + 2] = -2 + r() * 5;
    }
    return a;
  }, [count]);
  useFrame((st, delta) => {
    if (!ref.current || still) return;
    ref.current.rotation.y += delta * 0.02;
    ref.current.position.y = Math.sin(st.clock.elapsedTime * 0.2) * 0.08;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.022} color="#ffd9a0" transparent opacity={0.55} depthWrite={false} />
    </points>
  );
}

// Scroll moves the camera from stop to stop; the pointer adds a little parallax on top.
// Reduced motion: the camera cuts to the nearest stop instead of travelling.
function CameraRig({ still }: { still: boolean }) {
  const wide = useThree((s) => s.size.width) >= 900;
  const stops = wide ? STOPS_WIDE : STOPS_NARROW;
  // scratch vectors live in a ref: the frame loop owns them, React never reads them
  const v = useRef({ pos: new THREE.Vector3(), look: new THREE.Vector3(), a: new THREE.Vector3(), b: new THREE.Vector3() });
  const lookNow = useRef<THREE.Vector3 | null>(null);

  useFrame((state, delta) => {
    const { pos, look, a, b } = v.current;
    const s = Math.min(stops.length - 1, Math.max(0, window.scrollY / Math.max(1, window.innerHeight)));
    const i = Math.min(stops.length - 2, Math.floor(s));
    const f = still ? Math.round(s - i) : smooth(Math.min(1, s - i));
    pos.lerpVectors(a.fromArray(stops[i][0]), b.fromArray(stops[i + 1][0]), f);
    look.lerpVectors(a.fromArray(stops[i][1]), b.fromArray(stops[i + 1][1]), f);
    if (!still) {
      pos.x += state.pointer.x * 0.5;
      pos.y += state.pointer.y * 0.25;
    }
    const k = still ? 1 : 1 - Math.exp(-4 * delta);
    if (!lookNow.current) {
      lookNow.current = look.clone();
      state.camera.position.copy(pos);
    }
    state.camera.position.lerp(pos, k);
    lookNow.current.lerp(look, k);
    state.camera.lookAt(lookNow.current);
  });
  return null;
}

type Fonts = { mono: string; display: string };

function World({ on, onToggle, reducedMotion, fonts, small }: Props & { fonts: Fonts; small: boolean }) {
  return (
    <>
      <CameraRig still={reducedMotion} />

      {/* key: warm table lamp off to the left */}
      <spotLight position={[-5, 6, 4.5]} angle={0.55} penumbra={1} intensity={90} color="#ffc489" decay={2} />
      {/* rim: cool window light from behind */}
      <directionalLight position={[5, 4, -6]} intensity={1.1} color="#8aa0ff" />
      {/* fill: the night room */}
      <ambientLight intensity={0.28} color="#3c4a86" />

      {/* reflections for lacquer, brass and chrome, baked once inside the canvas (no downloads) */}
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={3} color="#ffcf9a" position={[-4, 3, 3]} scale={[4, 3, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#7e92ff" position={[5, 2, -4]} scale={[3, 5, 1]} />
        <Lightformer form="ring" intensity={0.6} color="#ffffff" position={[0, 6, 0]} scale={2} />
      </Environment>

      <group rotation-y={-0.38}>
        <RadioModel on={on} still={reducedMotion} dialFont={fonts.mono} onToggle={onToggle} />
        <TamilNotes on={on} still={reducedMotion} font={fonts.display} />
      </group>
      <Table />
      <ContactShadows position={[0, 0.008, 0]} scale={7} blur={2.6} far={2.4} opacity={0.8} frames={1} resolution={512} color="#120806" />
      <Dust still={reducedMotion} count={small ? 140 : 320} />
    </>
  );
}

export default function RadioScene(props: Props) {
  const [fonts, setFonts] = useState<Fonts | null>(null);
  const small = useMediaQuery("(max-width: 640px)");

  // The dial and the flying letters are drawn with the page's own faces, so wait for them.
  // The Tamil sample text matters: the browser only fetches the Tamil subset when Tamil is asked for.
  useEffect(() => {
    const css = getComputedStyle(document.documentElement);
    const mono = css.getPropertyValue("--font-mono").trim() || "monospace";
    const display = css.getPropertyValue("--font-display").trim() || "sans-serif";
    let alive = true;
    Promise.all([document.fonts.load(`600 26px ${mono}`), document.fonts.load(`700 96px ${display}`, "அஆகதமழ")])
      .catch(() => {})
      .then(() => alive && setFonts({ mono, display }));
    return () => {
      alive = false;
    };
  }, []);

  if (!fonts) return null;
  return (
    <Canvas
      dpr={[1, small ? 1.5 : 2]}
      camera={{ position: [0, 2.5, 9], fov: 34 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      // the canvas sits behind the page copy, so it listens on the whole document
      eventSource={document.documentElement}
      eventPrefix="client"
    >
      <Suspense fallback={null}>
        <World {...props} fonts={fonts} small={small} />
      </Suspense>
    </Canvas>
  );
}
