"use client";

import { motion } from "framer-motion";
import { Button } from "./button";
import type { Button as ButtonPrimitive } from "@base-ui/react/button";
import type { VariantProps } from "class-variance-authority";
import type { buttonVariants } from "./button";

type ButtonProps = ButtonPrimitive.Props & VariantProps<typeof buttonVariants>;

export function AnimatedButton({ children, ...props }: ButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button {...props}>{children}</Button>
    </motion.div>
  );
}
