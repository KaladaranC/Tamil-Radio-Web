"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { site, tel, webStreamUrl } from "@/lib/site";
import { useMediaQuery } from "@/lib/useMediaQuery";

// WebGL only exists in the browser; a dim amber glow holds the space while the scene loads.
const RadioScene = dynamic(() => import("./radio/RadioScene"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[radial-gradient(ellipse_at_66%_55%,rgba(242,166,64,0.10),transparent_55%)]" />,
});

// The first screen, plus the radio itself: a fixed scene behind the whole page that the
// later sections move the camera around.
export default function Hero() {
  const audio = useRef<HTMLAudioElement>(null);
  const [on, setOn] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  async function toggle() {
    const next = !on;
    setOn(next);
    setError(false);
    const a = audio.current;
    if (!a) return;
    if (!next) {
      a.pause();
      a.removeAttribute("src"); // drop the buffer so switching on again is live, not stale
      a.load();
      return;
    }
    a.src = webStreamUrl;
    try {
      await a.play();
    } catch {
      setError(true);
    }
  }

  const status = !on
    ? ""
    : error
      ? "The stream did not start. Switch the radio off and on again."
      : webStreamUrl
        ? playing
          ? "Playing ILC Tamil Radio live."
          : "Connecting to the stream."
        : "Tuned to ILC. Live sound plays in the Android app for now.";

  return (
    <>
      <div aria-hidden="true" className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_62%_48%,#1d2547_0%,#0e1326_64%)]">
        <RadioScene on={on} onToggle={toggle} reducedMotion={reducedMotion} />
      </div>

      <section className="pointer-events-none relative flex h-svh flex-col justify-end pb-10 lg:justify-start lg:pb-0 lg:pt-[22vh]">
        {/* phone: a scrim so the copy reads over the radio's lower half */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-[1] h-3/5 bg-gradient-to-t from-night via-night/85 to-transparent lg:hidden" />
        <div className="pointer-events-auto mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="max-w-[31rem]">
            <p lang="ta" className="font-display text-[clamp(2.9rem,9.5vw,5.6rem)] font-bold leading-[0.98] tracking-[-0.02em] [font-stretch:75%]">
              தமிழ் வானொலி
            </p>
            <h1 className="mt-4 font-display text-[clamp(1.6rem,3.6vw,2.4rem)] font-semibold leading-[1.08] tracking-[-0.01em] [font-stretch:87.5%]">
              ILC Tamil Radio, live on the web and on Android.
            </h1>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={toggle}
                aria-pressed={on}
                className="inline-flex min-h-12 items-center gap-3 rounded-full bg-amber py-2 pl-2 pr-6 font-semibold text-night transition-[filter,transform] duration-200 ease-out hover:brightness-105 active:scale-[0.98]"
              >
                {/* a bakelite knob that turns with the switch; its lamp is the on-air light */}
                <span
                  aria-hidden="true"
                  className={`relative grid h-8 w-8 place-items-center rounded-full bg-[#e6d9bf] shadow-[0_1px_2px_rgba(0,0,0,0.35),inset_0_-2px_0_rgba(0,0,0,0.2)] transition-transform duration-700 ease-out ${on ? "rotate-[140deg]" : ""}`}
                >
                  <span className="absolute top-1 h-2.5 w-[3px] rounded bg-night/70" />
                  <span className={`h-2 w-2 rounded-full transition-[background-color,box-shadow] duration-700 ${on ? "bg-kumkum shadow-[0_0_8px_2px_rgba(211,58,47,0.75)]" : "bg-night/25"}`} />
                </span>
                {on ? "Switch the radio off" : "Switch the radio on"}
              </button>
              <a
                href={site.playStore}
                className="inline-flex min-h-12 items-center rounded-full px-5 font-semibold text-chalk underline decoration-chalk/30 decoration-1 underline-offset-[6px] transition-colors hover:decoration-amber"
              >
                Get the Android app
              </a>
            </div>

            <p aria-live="polite" className={`mt-3 min-h-6 text-sm ${error ? "text-kumkum" : "text-amber"}`}>
              {status}
            </p>

            <p className="mt-6 text-[17px] leading-relaxed text-haze">
              Live phone-in line{" "}
              <a href={tel(site.phones.liveLine)} className="whitespace-nowrap font-semibold text-chalk tabular-nums hover:text-amber">
                {site.phones.liveLine}
              </a>
            </p>

            {webStreamUrl ? (
              <audio
                ref={audio}
                preload="none"
                onPlaying={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onError={() => {
                  if (audio.current?.getAttribute("src")) setError(true);
                }}
              />
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
