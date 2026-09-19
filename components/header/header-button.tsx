"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/motion/button/base";

export function HeaderButton({ label }: { label: string }) {
  return (
    <Button
      variant="outline"
      size="lg"
      ripple
      className="h-14 cursor-pointer gap-2.5 px-7 text-lg"
    >
      {label}
      <ArrowRight className="h-5 w-5" />
    </Button>
  );
}
