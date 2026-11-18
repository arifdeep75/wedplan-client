
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  Camera,
  Flower2,
  Heart,
  MapPin,
  Search,
  Shirt,
  Sparkles,
  ShieldCheck,
  Utensils,
} from "lucide-react";

import FeaturedServices from "@/components/home/featured-services";
import Reveal from "@/components/shared/reveal";

// Service categories from the WedPlan platform (matches server constants)
const categories = [
  {
    name: "Photography & Videography",
    description: "Capture every beautiful moment",
    icon: Camera,
  },
  {
    name: "Wedding Venues",
    description: "Find your perfect setting",
    icon: MapPin,
  },
  {
    name: "Decoration & Florist",
    description: "Bring your vision to life",
    icon: Flower2,
  },
  {
    name: "Catering Services",
    description: "Create a memorable feast",
    icon: Utensils,
  },
  {
    name: "Makeup & Styling",
    description: "Look and feel your best",
    icon: Sparkles,
  },
  {
    name: "Wedding Fashion",
    description: "Dress the part, effortlessly",
    icon: Shirt,
  },
];

const steps = [
  {
    number: "01",
    title: "Discover",
    description:
      "Explore trusted wedding services by category, location, and style — all in one place.",
    icon: Search,
  },
  {
    number: "02",
    title: "Book",
    description:
      "Choose a date, share your details, and send a booking request to the vendor.",
    icon: CalendarCheck,
  },
  {
    number: "03",
    title: "Celebrate",
    description:
      "Track every request from your dashboard and enjoy a beautifully planned day.",
    icon: Heart,
  },
];

const highlights = [
  {
    number: "01",
    title: "Discover trusted vendors",
    description:
      "Explore wedding professionals and find the right people for your celebration.",
    icon: Search,
  },
  {
    number: "02",
    title: "Plan with confidence",
    description:
      "Compare services, explore details, and send booking requests in one place.",
    icon: CalendarCheck,
  },
  {
    number: "03",
    title: "Celebrate your way",
    description:
      "Keep your planning organized and focus on the moments that matter.",
    icon: Heart,
  },
];

export default function Home() {
  return (
    <div className="overflow-hidden bg-white">
      {/* Hero / Banner */}
      <section className="relative flex min-h-162.5 items-center bg-[#252525] md:min-h-180">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2200&q=90')",
          }}
        />

        <div className="absolute inset-0 bg-black/45" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-24 md:px-8 lg:px-10">
          <div className="max-w-3xl">
            <Reveal>
              <p className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
                <span className="h-px w-9 bg-[#d8c8c3]" />
                Your story. Your celebration.
              </p>

              <h1 className="font-heading text-5xl leading-[1.12] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[82px]">
                Every love story deserves a
                <span className="block italic text-[#e8dcd8]">
                  beautiful beginning.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-8 text-white/85 md:text-lg">
                Discover the right wedding professionals, find inspiration, and
                bring your dream celebration to life — all in one place.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/services"
                  className="flex h-14 items-center justify-center gap-2 bg-white px-8 text-sm font-semibold text-[#252525] transition hover:bg-[#e8dcd8]"
                >
                  Explore Wedding Services
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/sign-up"
                  className="flex h-14 items-center justify-center gap-2 border border-white/60 px-8 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Become a Vendor
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.25}>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-white/75">
                <span className="flex items-center gap-2">
                  <ShieldCheck size={15} />
                  Discover trusted professionals
                </span>
                <span className="flex items-center gap-2">
                  <Heart size={15} />
                  Plan with confidence
                </span>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="absolute bottom-8 right-8 hidden items-center gap-3 text-xs tracking-widest text-white/70 md:flex">
          <span className="h-px w-10 bg-white/60" />
          MAKE IT UNFORGETTABLE
        </div>
      </section>

      {/* Intro */}
      <section className="px-5 py-20 md:px-8 md:py-28 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 md:items-end">
          <Reveal>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-[#a58f88]">
              Welcome to WedPlan
            </p>

            <h2 className="max-w-xl font-heading text-4xl leading-tight text-[#252525] sm:text-5xl md:text-6xl">
              The beginning of something
              <span className="italic text-[#b9a6a0]"> beautiful.</span>
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="md:justify-self-end md:pb-2">
            <p className="max-w-lg text-sm leading-8 text-[#737373] md:text-base">
              Planning a wedding should feel just as special as the day itself.
              WedPlan brings wedding services and talented professionals
              together to make your journey simpler, more personal, and more
              enjoyable.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Dynamic Section 1: Featured Wedding Services */}
      <div className="border-y border-[#f0eeeb] bg-[#fafaf8]">
        <FeaturedServices />
      </div>

      {/* Dynamic Section 2: Wedding Service Categories */}
      <section className="bg-[#f4f4f2] px-5 py-20 md:px-8 md:py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#a58f88]">
                  Explore your options
                </p>

                <h2 className="font-heading text-4xl text-[#252525] sm:text-5xl">
                  Find what you need
                </h2>

                <p className="mt-4 text-sm text-[#737373]">
                  Every little detail helps create your perfect day.
                </p>
              </div>

              <Link
                href="/services"
                className="group flex items-center gap-2 text-sm font-semibold text-[#252525] transition hover:text-[#9b8179]"
              >
                View all services
                <ArrowUpRight
                  size={17}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => {
              const Icon = category.icon;

              return (
                <Reveal key={category.name} delay={(index % 3) * 0.07}>
                  <Link
                    href={`/services?category=${encodeURIComponent(category.name)}`}
                    className="group flex min-h-36 items-center gap-5 border border-[#e8e5e1] bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-[#b9a6a0] hover:shadow-lg"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-[#f4f4f2] text-[#9b8179] transition-colors group-hover:bg-[#e9dedb]">
                      <Icon size={25} strokeWidth={1.5} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="mb-2 text-[10px] tracking-[0.2em] text-[#b9a6a0]">
                        0{index + 1}
                      </p>

                      <h3 className="font-heading text-xl text-[#252525]">
                        {category.name}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-[#888888]">
                        {category.description}
                      </p>
                    </div>

                    <ArrowUpRight
                      size={18}
                      className="shrink-0 text-[#aaa29e] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                    />
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* How WedPlan Works */}
      <section className="px-5 py-20 md:px-8 md:py-28 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-[#a58f88]">
                Simple from start to finish
              </p>

              <h2 className="font-heading text-4xl leading-tight text-[#252525] sm:text-5xl">
                How WedPlan
                <span className="italic text-[#b9a6a0]"> works</span>
              </h2>

              <p className="mt-5 text-sm leading-7 text-[#737373]">
                Three gentle steps between today and your wedding day.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-12 md:grid-cols-3 md:gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <Reveal key={step.number} delay={index * 0.08}>
                  <div className="border-t border-[#e8e5e1] pt-7">
                    <div className="mb-8 flex items-center justify-between">
                      <span className="font-heading text-3xl italic text-[#b9a6a0]">
                        {step.number}
                      </span>

                      <Icon
                        size={25}
                        strokeWidth={1.4}
                        className="text-[#b9a6a0]"
                      />
                    </div>

                    <h3 className="font-heading text-2xl text-[#252525]">
                      {step.title}
                    </h3>

                    <p className="mt-4 max-w-sm text-sm leading-7 text-[#737373]">
                      {step.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why WedPlan */}
      <section className="bg-[#252525] px-5 py-20 text-white md:px-8 md:py-28 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-[#c6b2ab]">
                Why WedPlan
              </p>

              <h2 className="font-heading text-4xl leading-tight sm:text-5xl">
                Less stress. More
                <span className="italic text-[#c6b2ab]"> celebration.</span>
              </h2>

              <p className="mt-5 text-sm leading-7 text-white/60">
                Your wedding journey deserves a thoughtful place to begin.
                We make finding and connecting with wedding professionals easier.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-12 md:grid-cols-3 md:gap-8">
            {highlights.map((item, index) => {
              const Icon = item.icon;

              return (
                <Reveal key={item.number} delay={index * 0.08}>
                  <div className="border-t border-white/20 pt-7">
                    <div className="mb-8 flex items-center justify-between">
                      <span className="font-heading text-3xl italic text-[#c6b2ab]">
                        {item.number}
                      </span>

                      <Icon
                        size={25}
                        strokeWidth={1.4}
                        className="text-[#c6b2ab]"
                      />
                    </div>

                    <h3 className="font-heading text-2xl">{item.title}</h3>

                    <p className="mt-4 max-w-sm text-sm leading-7 text-white/55">
                      {item.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 py-24 md:px-8 md:py-32 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <Heart
              size={27}
              strokeWidth={1.4}
              className="mx-auto mb-7 text-[#b9a6a0]"
            />

            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-[#a58f88]">
              Your journey starts here
            </p>

            <h2 className="font-heading text-4xl leading-tight text-[#252525] sm:text-5xl md:text-6xl">
              Ready to plan a day
              <span className="block italic text-[#b9a6a0]">
                worth remembering?
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-[#737373]">
              Find your vendors, explore your possibilities, and start creating
              a celebration that feels like you.
            </p>

            <Link
              href="/services"
              className="mt-9 inline-flex items-center gap-3 bg-[#252525] px-8 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[#444444]"
            >
              Explore Wedding Services
              <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
