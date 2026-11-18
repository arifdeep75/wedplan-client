"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { authClient, dashboardPath, type AuthUser } from "@/lib/auth-client";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Browse Services", href: "/services" },
];

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user as AuthUser | undefined;

  const menuRef = useRef<HTMLDivElement>(null);

  // Close the profile dropdown when clicking outside or pressing Escape
  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  async function handleSignOut() {
    setMenuOpen(false);
    setIsOpen(false);

    const { error } = await authClient.signOut();

    if (error) {
      toast.error("Failed to sign out. Please try again.");
      return;
    }

    toast.success("Signed out successfully");
    router.push("/");
  }

  function closeMobileMenu() {
    setIsOpen(false);
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#e9e7e4] bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8 lg:px-10">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2"
          onClick={closeMobileMenu}
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
          {isPending ? (
            // Placeholder keeps the layout steady while the session resolves
            <div className="h-10 w-40" aria-hidden="true" />
          ) : user ? (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-3 py-1 transition-opacity hover:opacity-80"
              >
                <Avatar user={user} />

                <span className="max-w-35 truncate text-[13px] font-semibold text-[#252525]">
                  {user.name}
                </span>

                <ChevronDown
                  size={15}
                  className={`text-[#999999] transition-transform duration-200 ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+10px)] w-64 border border-[#e9e7e4] bg-white shadow-lg"
                >
                  {/* Identity */}
                  <div className="flex items-center gap-3 border-b border-[#e9e7e4] p-4">
                    <Avatar user={user} />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#252525]">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-[#999999]">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col p-2">
                    <Link
                      href={dashboardPath(user.role)}
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#252525] transition-colors hover:bg-[#f4f4f2]"
                    >
                      <LayoutDashboard size={16} className="text-[#999999]" />
                      Dashboard
                    </Link>

                    <Link
                      href="/profile"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#252525] transition-colors hover:bg-[#f4f4f2]"
                    >
                      <Settings size={16} className="text-[#999999]" />
                      Profile Settings
                    </Link>

                    <div className="mx-3 my-2 border-t border-[#e9e7e4]" />

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-3 py-2.5 text-left text-sm text-[#252525] transition-colors hover:bg-[#f4f4f2]"
                    >
                      <LogOut size={16} className="text-[#999999]" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
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
            </>
          )}
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
                onClick={closeMobileMenu}
                className="text-sm font-medium text-[#252525] transition-colors hover:text-[#b9a6a0]"
              >
                {link.name}
              </Link>
            ))}

            <div className="my-1 border-t border-[#e9e7e4]" />

            {isPending ? null : user ? (
              <>
                <div className="flex items-center gap-3">
                  <Avatar user={user} />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#252525]">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-[#999999]">
                      {user.email}
                    </p>
                  </div>
                </div>

                <Link
                  href={dashboardPath(user.role)}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 text-sm font-medium text-[#252525]"
                >
                  <LayoutDashboard size={16} className="text-[#999999]" />
                  Dashboard
                </Link>

                <Link
                  href="/profile"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 text-sm font-medium text-[#252525]"
                >
                  <Settings size={16} className="text-[#999999]" />
                  Profile Settings
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-3 text-left text-sm font-medium text-[#252525]"
                >
                  <LogOut size={16} className="text-[#999999]" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  onClick={closeMobileMenu}
                  className="text-sm font-semibold text-[#252525]"
                >
                  Log in
                </Link>

                <Link
                  href="/sign-up"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center gap-2 bg-[#252525] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#444444]"
                >
                  Get Started
                  <ArrowUpRight size={16} />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function Avatar({ user }: { user: AuthUser }) {
  const [imageError, setImageError] = useState(false);

  if (user.image && !imageError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.image}
        alt={user.name || "Profile"}
        onError={() => setImageError(true)}
        className="h-9 w-9 shrink-0 rounded-full border border-[#e9e7e4] object-cover"
      />
    );
  }

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f4f4f2] font-heading text-sm italic text-[#b9a6a0]">
      {(user.name || "?").charAt(0).toUpperCase()}
    </span>
  );
}
