"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function NavLink({
  href,
  exact = false,
  children,
}: {
  href: LinkProps["href"];
  exact?: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const target = typeof href === "string" ? href : "";
  const active =
    target.length > 0 &&
    (exact
      ? pathname === target
      : pathname === target || pathname.startsWith(`${target}/`));

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "text-sm font-medium text-zinc-900 underline decoration-2 underline-offset-4 dark:text-zinc-100"
          : "text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
      }
    >
      {children}
    </Link>
  );
}
