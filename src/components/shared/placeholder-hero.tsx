interface PlaceholderHeroProps {
  kicker: string;
  title: string;
  description: string;
}

// Minimal stand-in for areas that will be built in later milestones so that
// role-based redirects have somewhere to land.
export default function PlaceholderHero({
  kicker,
  title,
  description,
}: PlaceholderHeroProps) {
  return (
    <section className="bg-[#f4f4f2] px-5 py-24 md:py-32 lg:px-10">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-[#a58f88]">
          {kicker}
        </p>

        <h1 className="font-heading text-4xl leading-tight text-[#252525] md:text-5xl">
          {title}
        </h1>

        <p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-[#737373]">
          {description}
        </p>
      </div>
    </section>
  );
}
