"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ComponentProps } from "react";

// Wrap Next.js Link with Framer Motion for premium tactile feedback
const MotionLinkComponent = motion.create(Link);

export default function MotionLink(props: ComponentProps<typeof MotionLinkComponent>) {
    return (
        <MotionLinkComponent
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            {...props}
        />
    );
}
