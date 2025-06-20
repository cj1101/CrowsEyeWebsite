'use client';

import { cn } from "@/lib/utils";
import React from "react";

export const AnimatedGrid = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "absolute inset-0 h-full w-full",
        className
      )}
      {...rest}
    >
      <div
        className={cn(
          "h-full w-full",
          "[background:linear-gradient(to_right,theme(colors.slate.900/.2)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.slate.900/.2)_1px,transparent_1px)]",
          "[background-size:2rem_2rem]",
          "[mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]",
        )}
      ></div>
    </div>
  );
}; 