import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { motion, AnimatePresence } from "framer-motion";

const AvatarGroup = ({ children, className }) => {
    return (
        <TooltipPrimitive.Provider delayDuration={100}>
            <div className={`flex -space-x-3 items-center ${className}`}>
                {children}
            </div>
        </TooltipPrimitive.Provider>
    );
};

const Avatar = ({ children, className }) => {
    return (
        <div className={`relative group transition-transform hover:scale-110 hover:z-10 ${className}`}>
            {children}
        </div>
    );
};

const AvatarImage = ({ src, className }) => (
    <AvatarPrimitive.Root className={`flex h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white bg-secondary ${className}`}>
        <AvatarPrimitive.Image src={src} className="aspect-square h-full w-full object-cover" />
        <AvatarPrimitive.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-muted text-xs font-semibold">
            SC
        </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
);

const AvatarFallback = ({ children, className }) => (
    <AvatarPrimitive.Fallback className={`flex h-full w-full items-center justify-center rounded-full bg-muted text-xs font-semibold ${className}`}>
        {children}
    </AvatarPrimitive.Fallback>
);

const AvatarGroupTooltip = ({ children }) => (
    <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
            <div className="absolute inset-0 cursor-pointer" />
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
                side="top"
                sideOffset={5}
                className="z-50 overflow-hidden rounded-md bg-text px-3 py-1.5 text-xs text-white shadow-md animate-in fade-in zoom-in-95 duration-200"
            >
                {children}
            </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
);

const AvatarGroupTooltipArrow = () => (
    <TooltipPrimitive.Arrow className="fill-text" />
);

export {
    AvatarGroup,
    Avatar,
    AvatarImage,
    AvatarFallback,
    AvatarGroupTooltip,
    AvatarGroupTooltipArrow
};
