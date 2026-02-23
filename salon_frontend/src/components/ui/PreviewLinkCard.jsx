import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { motion, AnimatePresence } from "framer-motion";

const PreviewLinkCard = HoverCardPrimitive.Root;

const PreviewLinkCardTrigger = HoverCardPrimitive.Trigger;

const PreviewLinkCardContent = React.forwardRef(({ className, align = "center", sideOffset = 10, children, ...props }, ref) => (
    <HoverCardPrimitive.Portal>
        <HoverCardPrimitive.Content
            ref={ref}
            align={align}
            sideOffset={sideOffset}
            className="z-50"
            {...props}
        >
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="w-64 overflow-hidden rounded-xl border border-border bg-white shadow-xl"
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </HoverCardPrimitive.Content>
    </HoverCardPrimitive.Portal>
));
PreviewLinkCardContent.displayName = HoverCardPrimitive.Content.displayName;

const PreviewLinkCardImage = ({ src, alt, className }) => (
    <div className={`aspect-video w-full overflow-hidden bg-secondary ${className}`}>
        <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
        />
    </div>
);

export { PreviewLinkCard, PreviewLinkCardTrigger, PreviewLinkCardContent, PreviewLinkCardImage };
