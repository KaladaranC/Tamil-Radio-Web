import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

export default function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="rounded-[5px] bg-white px-1.5 py-1" aria-label={`${site.name} home`}>
          <Image src="/logo.png" alt="" width={58} height={30} priority />
        </Link>
        <nav className="flex items-center gap-6 text-[15px] font-semibold text-haze">
          <Link href="/#listen" className="transition-colors hover:text-chalk">
            Listen
          </Link>
          <Link href="/#call" className="transition-colors hover:text-chalk">
            Call in
          </Link>
        </nav>
      </div>
    </header>
  );
}
