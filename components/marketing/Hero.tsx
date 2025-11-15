import { copy } from "@/config/copy";
import { ArrowRight, Headset, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const FEATURE_BULLETS = [
  {
    icon: Truck,
    title: copy.marketing.hero.featureBullets[0].title,
    description: copy.marketing.hero.featureBullets[0].description,
  },
  {
    icon: Headset,
    title: copy.marketing.hero.featureBullets[1].title,
    description: copy.marketing.hero.featureBullets[1].description,
  },
];

export default function Hero() {
  return (
    <section className="bg-background/50 py-48 md:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 md:flex-row md:items-center">
        <div className="flex-1 space-y-6">
          <header className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl md:text-6xl">
              {copy.marketing.hero.title}
            </h1>
            <p className="max-w-lg text-base text-foreground/70 md:text-lg">
              {copy.marketing.hero.description}
            </p>
          </header>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/products"
              className="btn-primary"
            >
              {copy.marketing.hero.primaryCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/customize"
              className="btn-outline"
            >
              {copy.marketing.hero.secondaryCta}
            </Link>
          </div>

          <ul className="flex flex-col gap-3 text-sm text-foreground/70 sm:flex-row sm:items-center">
            {FEATURE_BULLETS.map(({ icon: Icon, title, description }) => (
              <li
                key={title}
                className="flex flex-col gap-2"
              >
                <div className="flex gap-2 font-medium text-foreground">
                  <Icon className="h-5 w-5 text-primary-200" />
                  <p className="text-sm">{title}</p>
                </div>
                <p className="text-xs">{description}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1">
          <div className="relative overflow-hidden rounded-4xl border border-primary-900/50 bg-primary-900/20 shadow-lg shadow-primary-900/40">
            <Image
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80"
              alt="Custom apparel showcase"
              width={720}
              height={540}
              className="h-full w-full object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
