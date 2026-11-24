import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How the ${site.name} app and website handle your data.`,
};

// Keep in step with legal/privacy-policy.html and the Play Console Data safety form.
export default function Privacy() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 pb-16 pt-28 sm:px-6 lg:pt-32">
        <h1 className="font-display text-3xl font-bold tracking-tight [font-stretch:75%] sm:text-5xl">Privacy policy</h1>
        <p className="mt-2 text-haze">Last updated: 24 November 2026</p>

        <div className="mt-8 space-y-8 leading-relaxed text-chalk/90 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-chalk [&_a]:text-amber [&_a]:underline [&_p]:mt-2">
          <p>
            This policy covers the {site.name} Android app and this website. The app plays the {site.name} live stream
            and links to our social pages and contact details.
          </p>

          <section>
            <h2>What we collect</h2>
            <p>
              There are no accounts. Neither the app nor this website asks for your name, email, location, contacts,
              photos or microphone, and we do not collect or store personal information ourselves.
            </p>
          </section>

          <section>
            <h2>Advertising in the app</h2>
            <p>
              The app shows banner ads through Google AdMob. To show and measure ads, Google may collect your device&apos;s
              advertising ID, IP address, device and app information, and ad interactions. If you are in the UK or the
              European Economic Area, the app asks for your consent before any ads load, and you can change your choice
              later. You can reset or delete your advertising ID in your phone&apos;s settings. See{" "}
              <a href="https://policies.google.com/technologies/partner-sites">how Google uses this data</a>.
            </p>
          </section>

          <section>
            <h2>Station content</h2>
            <p>
              The station list and links are loaded from Google Firebase, and the audio stream comes from our streaming
              provider. Like any web server, these services receive your IP address when you connect. We do not use this
              to identify you.
            </p>
          </section>

          <section>
            <h2>Notifications</h2>
            <p>
              On Android 13 and newer the app asks permission to show a notification. It is only used for the playback
              controls while the radio is playing.
            </p>
          </section>

          <section>
            <h2>Children</h2>
            <p>The app is not directed at children under 13 and does not knowingly collect information from them.</p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>
              Questions about this policy: <a href={`mailto:${site.email}`}>{site.email}</a>
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
