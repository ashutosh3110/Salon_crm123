import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = React.forwardRef(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        asChild
    >
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm ${className}`}
            {...props}
        />
    </DialogPrimitive.Overlay>
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const SheetContent = React.forwardRef(({ side = "right", className, children, ...props }, ref) => (
    <SheetPortal forceMount>
        <AnimatePresence mode="wait">
            {props.open && (
                <>
                    <SheetOverlay key="overlay" />
                    <DialogPrimitive.Content
                        ref={ref}
                        asChild
                        {...props}
                    >
                        <motion.div
                            key="content"
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className={`fixed top-4 bottom-4 right-4 z-50 w-full sm:w-[450px] bg-white shadow-2xl border flex flex-col p-8 rounded-3xl ${className}`}
                        >
                            {children}
                            <DialogPrimitive.Close asChild>
                                <button
                                    type="button"
                                    className="absolute right-6 top-6 rounded-full p-2 text-text transition-all hover:bg-primary/10 hover:text-primary active:scale-95 z-[100] border-2 border-primary/20 hover:border-primary bg-white shadow-sm flex items-center justify-center group"
                                >
                                    <X className="h-5 w-5 transition-transform group-hover:rotate-90" />
                                    <span className="sr-only">Close</span>
                                </button>
                            </DialogPrimitive.Close>
                        </motion.div>
                    </DialogPrimitive.Content>
                </>
            )}
        </AnimatePresence>
    </SheetPortal>
));
SheetContent.displayName = "SheetContent";

const SheetHeader = ({ className, ...props }) => (
    <div className={`flex flex-col space-y-2 text-left mb-10 ${className}`} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetTitle = React.forwardRef(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={`text-2xl font-bold text-text tracking-tight ${className}`}
        {...props}
    />
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;

const SheetDescription = React.forwardRef(({ className, ...props }, ref) => (
    <DialogPrimitive.Description
        ref={ref}
        className={`text-base text-text-secondary leading-relaxed ${className}`}
        {...props}
    />
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;

export {
    Sheet,
    SheetPortal,
    SheetOverlay,
    SheetTrigger,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
};
