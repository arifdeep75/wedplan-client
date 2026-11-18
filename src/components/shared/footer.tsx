import Link from "next/link";
import { Heart } from "lucide-react";

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
  { name: "Facebook", href: "https://facebook.com", icon: FacebookIcon },
  { name: "Instagram", href: "https://instagram.com", icon: InstagramIcon },
  { name: "X", href: "https://x.com", icon: XIcon },
  { name: "YouTube", href: "https://youtube.com", icon: YoutubeIcon },
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
                    <Icon />
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
            © 2026 WedPlan. All rights reserved.
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

// Brand icons (lucide-react no longer ships brand logos)
function FacebookIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5H16V4.9c-.3 0-1.2-.1-2.2-.1-2.2 0-3.8 1.3-3.8 3.9V11H7.5v3h2.5v7h3.5z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.7 3h3l-6.9 7.9L22 21h-6.3l-4.6-6.1L5.6 21h-3l7.4-8.5L2 3h6.4l4.2 5.6L17.7 3zm-1.1 16h1.7L6.9 4.7H5.1L16.6 19z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.9C18.2 5 12 5 12 5s-6.2 0-7.8.3A2.6 2.6 0 0 0 2.4 7.2 27.3 27.3 0 0 0 2 12a27.3 27.3 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.9C5.8 19 12 19 12 19s6.2 0 7.8-.3a2.6 2.6 0 0 0 1.8-1.9A27.3 27.3 0 0 0 22 12a27.3 27.3 0 0 0-.4-4.8zM10 15.2V8.8l5.2 3.2-5.2 3.2z" />
    </svg>
  );
}
