import Link from "next/link";
import { Heart, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const exploreLinks = [
  { name: "Home", href: "/" },
  { name: "Browse Services", href: "/services" },
  { name: "Sign In", href: "/sign-in" },
  { name: "Create Account", href: "/sign-up" },
];

const vendorLinks = [
  { name: "Become a Vendor", href: "/sign-up" },
  { name: "Vendor Dashboard", href: "/dashboard/vendor" },
  { name: "Vendor Sign In", href: "/sign-in" },
];

const supportLinks = [
  { name: "Profile Settings", href: "/profile" },
  { name: "My Dashboard", href: "/dashboard/customer" },
];

const socialLinks = [
  { name: "Facebook", href: "https://facebook.com", icon: Facebook },
  { name: "Instagram", href: "https://instagram.com", icon: Instagram },
  { name: "Twitter", href: "https://x.com", icon: Twitter },
  { name: "YouTube", href: "https://youtube.com", icon: Youtube },
];

export default function Footer() {
  return (
    <footer className="bg-[#252525] text-white">
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-16 md:px-8 md:pt-20 lg:px-10">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="group inline-flex items-center gap-2">
              <Heart
                size={22}
                strokeWidth={1.7}
                className="text-[#b9a6a0] transition-transform duration-300 group-hover:scale-110"
              />

              <span className="text-[24px] font-semibold tracking-[-1.2px] text-white">
                WedPlan<span className="text-[#b9a6a0]">.</span>
              </span>
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-7 text-white/55">
              Discover trusted wedding professionals, explore beautiful
              services, and plan your perfect wedding — all in one place.
            </p>

            {/* Social media */}
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;

                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="flex h-9 w-9 items-center justify-center border border-white/15 text-white/60 transition hover:border-[#b9a6a0] hover:text-[#b9a6a0]"
                  >
                    <Icon size={15} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Explore */}
          <nav aria-label="Explore">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#c6b2ab]">
              Explore
            </p>

            <ul className="space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* For Vendors */}
          <nav aria-label="For vendors">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#c6b2ab]">
              For Vendors
            </p>

            <ul className="space-y-3">
              {vendorLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#c6b2ab]">
              Contact
            </p>

            <ul className="space-y-3 text-sm text-white/60">
              <li>
                <a
                  href="mailto:support@wedplan.com"
                  className="transition-colors hover:text-white"
                >
                  support@wedplan.com
                </a>
              </li>

              <li>
                <a
                  href="tel:+8801700000000"
                  className="transition-colors hover:text-white"
                >
                  +880 1700-000000
                </a>
              </li>

              <li className="leading-6">Dhaka, Bangladesh</li>
            </ul>

            <p className="mt-6 mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#c6b2ab]">
              Support
            </p>

            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-7 sm:flex-row">
          <p className="text-xs text-white/45">
            © {new Date().getFullYear()} WedPlan. All rights reserved.
          </p>

          <p className="text-xs tracking-[0.2em] text-white/45">
            MADE WITH <Heart size={11} className="inline text-[#b9a6a0]" /> FOR
            EVERY CELEBRATION
          </p>
        </div>
      </div>
    </footer>
  );
}
