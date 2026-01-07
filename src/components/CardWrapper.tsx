"use client";

import { motion } from "framer-motion";

export default function CardWrapper({ children, index = 0 }: { children: React.ReactNode, index?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="h-full"
        >
            {children}
        </motion.div>
    );
}
