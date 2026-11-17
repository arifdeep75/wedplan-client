
"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Menu, X, ArrowUpRight } from "lucide-react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Find Vendors", href: "/services" },
  { name: "About", href: "/about" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e9e7e4] bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8 lg:px-10">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2"
          onClick={() => setIsOpen(false)}
        >
          <Heart
            size={23}
            strokeWidth={1.7}
            className="text-[#b9a6a0] transition-transform duration-300 group-hover:scale-110"
          />

          <span className="text-[25px] font-semibold tracking-[-1.2px] text-[#252525]">
            WedPlan<span className="text-[#b9a6a0]">.</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-9 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium tracking-wide text-[#555555] transition-colors duration-200 hover:text-[#b9a6a0]"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/sign-in"
            className="text-[13px] font-semibold text-[#252525] transition-colors hover:text-[#b9a6a0]"
          >
            Log in
          </Link>

          <Link
            href="/sign-up"
            className="group flex items-center gap-2 bg-[#252525] px-5 py-3 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-[#444444]"
          >
            Get Started
            <ArrowUpRight
              size={15}
              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-10 items-center justify-center text-[#252525] transition-colors hover:bg-[#f4f4f2] md:hidden"
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-[#e9e7e4] bg-white px-5 py-6 md:hidden"
        >
          <div className="flex flex-col gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-[#252525] transition-colors hover:text-[#b9a6a0]"
              >
                {link.name}
              </Link>
            ))}

            <div className="my-1 border-t border-[#e9e7e4]" />

            <Link
              href="/sign-in"
              onClick={() => setIsOpen(false)}
              className="text-sm font-semibold text-[#252525]"
            >
              Log in
            </Link>

            <Link
              href="/sign-up"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 bg-[#252525] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#444444]"
            >
              Get Started
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
