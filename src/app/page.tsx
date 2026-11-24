import Hero from "@/components/Hero";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { site, tel, webStreamUrl } from "@/lib/site";

// The page is one walk around the radio: each screen is one camera stop (RadioScene STOPS).
// 1 the front (Hero), 2 the lit dial (where to listen), 3 the antenna (call the studio).

const ways = [
  {
    name: "The Android app",
    body: "Keeps playing with the screen locked, has a sleep timer that switches the radio off after 15 to 90 minutes, and sends your song requests to the studio.",
    link: { href: site.playStore, label: "Install from Google Play" },
  },
  {
    name: "YouTube",
    body: "Live programmes also go out on the ILC Tamil Radio channel.",
    link: { href: site.youtube, label: "Open the YouTube channel" },
  },
  ...(webStreamUrl
    ? [{ name: "This page", body: "Switch the radio on at the top of the page. It plays in any browser.", link: { href: "#top", label: "Back to the radio" } }]
    : []),
];

const lines = [
  { label: "Live phone-in line", value: site.phones.liveLine, href: tel(site.phones.liveLine) },
  { label: "Customer service", value: site.phones.customerService, href: tel(site.phones.customerService) },
  { label: "Viber", value: site.phones.viber, href: `viber://add?number=${site.phones.viber.replace(/[^\d+]/g, "")}` },
  { label: "Email", value: site.email, href: `mailto:${site.email}` },
];

const linkCls = "font-semibold text-chalk underline decoration-chalk/30 decoration-1 underline-offset-[6px] transition-colors hover:decoration-amber";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="top">
        <Hero />

        {/* camera stop 2: close on the dial; copy sits to the right of it */}
        <section id="listen" className="pointer-events-none relative flex h-svh items-end pb-12 lg:items-center lg:pb-0">
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-[1] h-3/4 bg-gradient-to-t from-night via-night/90 to-transparent lg:inset-y-0 lg:left-auto lg:right-0 lg:h-auto lg:w-1/2 lg:bg-gradient-to-l" />
          <div className="pointer-events-auto mx-auto flex w-full max-w-6xl px-4 sm:px-6 lg:justify-end">
            <div className="max-w-[30rem]">
              <h2 className="font-display text-[clamp(2rem,4.6vw,3.4rem)] font-bold leading-[1.02] tracking-[-0.02em] [font-stretch:75%]">
                Tune in on your phone{webStreamUrl ? ", on YouTube, or right here." : " or on YouTube."}
              </h2>
              <dl className="mt-8 space-y-7">
                {ways.map((w) => (
                  <div key={w.name}>
                    <dt className="font-display text-2xl font-semibold [font-stretch:87.5%]">{w.name}</dt>
                    <dd className="mt-1 text-[17px] leading-relaxed text-haze">
                      {w.body}{" "}
                      <a href={w.link.href} className={`${linkCls} whitespace-nowrap`}>
                        {w.link.label}
                      </a>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* camera stop 3: high and back, the antenna up; copy on the left */}
        <section id="call" className="pointer-events-none relative flex h-svh items-end pb-12 lg:items-center lg:pb-0">
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-[1] h-4/5 bg-gradient-to-t from-night via-night/90 to-transparent lg:inset-y-0 lg:right-auto lg:left-0 lg:h-auto lg:w-1/2 lg:bg-gradient-to-r" />
          <div className="pointer-events-auto mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="max-w-[34rem]">
              <h2 className="font-display text-[clamp(2rem,4.6vw,3.4rem)] font-bold leading-[1.02] tracking-[-0.02em] [font-stretch:75%]">
                Ring the studio during a live programme.
              </h2>
              <p className="mt-4 text-[17px] leading-relaxed text-haze">
                For anything else, use customer service, Viber or email.
              </p>
              <dl className="mt-8 space-y-4">
                {lines.map((l) => (
                  <div key={l.label}>
                    <dt className="text-[15px] text-haze">{l.label}</dt>
                    <dd>
                      <a
                        href={l.href}
                        className="font-display text-[clamp(1.6rem,3.4vw,2.3rem)] font-semibold leading-tight tabular-nums [font-stretch:87.5%] transition-colors hover:text-amber"
                      >
                        {l.value}
                      </a>
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-8 text-[17px] text-haze">
                Follow the station on{" "}
                <a href={site.youtube} className={linkCls}>
                  YouTube
                </a>{" "}
                and{" "}
                <a href={site.facebook} className={linkCls}>
                  Facebook
                </a>
                .
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
