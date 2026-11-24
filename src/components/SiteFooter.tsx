import Link from "next/link";
import { site } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="bg-night">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-2 px-4 py-8 text-[15px] text-haze sm:px-6">
        <p>© {site.name}</p>
        <Link href="/privacy" className="underline decoration-haze/40 underline-offset-4 hover:text-chalk">
          Privacy policy
        </Link>
      </div>
    </footer>
  );
}
