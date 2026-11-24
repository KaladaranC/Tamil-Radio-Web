import Image from "next/image";
import { site } from "@/lib/site";

// Official badges, unaltered: Apple's from developer.apple.com, Google's from play.google.com/badges.
// Both render at Apple's 40px badge height. Google's PNG carries 41px of transparent clear space
// around a 564x168 badge, so it is drawn at 250/168 of the height and its padding is cancelled
// with negative margins; the layout gap provides the clear space instead.
const H = 40;
const PLAY_PAD = (41 * H) / 168;

export default function StoreBadges({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      <a href={site.appStore} className="block rounded-[9px] transition-transform duration-200 ease-out hover:-translate-y-px">
        <Image src="/badges/app-store.svg" alt="Download on the App Store" width={(119.66407 * H) / 40} height={H} unoptimized />
      </a>
      <a href={site.playStore} className="block rounded-[9px] transition-transform duration-200 ease-out hover:-translate-y-px">
        <Image
          src="/badges/google-play.png"
          alt="Get it on Google Play"
          width={(646 * H) / 168}
          height={(250 * H) / 168}
          style={{ margin: -PLAY_PAD }}
          unoptimized
        />
      </a>
    </div>
  );
}
