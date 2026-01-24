"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { logVisit } from "@/app/actions/log-visit";

export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Log the visit whenever the pathname changes
    logVisit(pathname);
  }, [pathname]);

  return null;
}
