"use client";

import { motion, Variants } from "framer-motion";

export const FADE_UP: Variants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
};

export const STAGGER_CONTAINER: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
        },
    },
};

export default function AnimatedSection({ children, className = "" }: { children: React.ReactNode, className?: string }) {
    return (
        <motion.section
            variants={FADE_UP}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10%" }}
            className={className}
        >
            {children}
        </motion.section>
    );
}
