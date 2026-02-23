import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Quote, Star, ArrowLeft, ArrowRight, PenLine } from 'lucide-react';
import {
    AvatarGroup,
    Avatar,
    AvatarImage,
    AvatarGroupTooltip,
    AvatarGroupTooltipArrow
} from '../ui/AvatarGroup';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "../ui/Sheet";

const testimonials = [
    {
        name: "Claudia Alves",
        content: "Thank you very much! An amazing job that exceeded all my expectations! I am very glad that I trusted you!",
        stars: 5,
        image: "https://i.pravatar.cc/150?u=claudia"
    },
    {
        name: "Priya Sharma",
        content: "Managing our salon became so much easier after switching to SalonCRM. The booking system is intuitive and our clients love the automated reminders.",
        stars: 5,
        image: "https://i.pravatar.cc/150?u=priya"
    },
    {
        name: "Rahul Varma",
        content: "The inventory management and staff performance tracking has helped us increase our revenue by 25% in just 3 months. Incredibly detailed reports.",
        stars: 5,
        image: "https://i.pravatar.cc/150?u=rahul"
    }
];

export default function Testimonials() {
    const scrollRef = useRef(null);
    const [isSharing, setIsSharing] = useState(false);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left'
                ? scrollLeft - clientWidth / 2
                : scrollLeft + clientWidth / 2;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <section className="py-16 bg-[#F9F6F3] overflow-hidden border-y border-border/50" id="testimonials">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-12 items-start">

                    {/* Left Side: Header & Nav */}
                    <div className="lg:w-1/3 w-full space-y-4 md:space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="mb-4 flex justify-center lg:justify-start">
                                <Quote className="w-8 h-8 md:w-12 md:h-12 text-primary fill-primary/20" />
                            </div>
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text leading-tight mb-4 md:mb-6 text-center lg:text-left">
                                What our <span className="lg:block">customers are</span> saying
                            </h2>

                            {/* Navigation */}
                            <div className="flex flex-col gap-6 lg:gap-10">
                                <div className="flex items-center justify-center lg:justify-start gap-6 text-gray-400">
                                    <button
                                        onClick={() => scroll('left')}
                                        className="p-1.5 transition-colors hover:text-primary active:scale-95"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>

                                    <div className="w-16 md:w-24 h-[1.5px] bg-gray-200 relative">
                                        <div className="absolute top-0 left-0 w-1/3 h-full bg-text" />
                                    </div>

                                    <button
                                        onClick={() => scroll('right')}
                                        className="p-1.5 transition-colors hover:text-primary active:scale-95"
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-4 md:space-y-6">
                                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 lg:gap-6">
                                        <div className="flex items-center gap-3">
                                            <AvatarGroup>
                                                {testimonials.map((item, index) => (
                                                    <Avatar key={index}>
                                                        <AvatarImage src={item.image} />
                                                        <AvatarGroupTooltip>
                                                            <AvatarGroupTooltipArrow />
                                                            <p className="font-medium text-xs">{item.name}</p>
                                                        </AvatarGroupTooltip>
                                                    </Avatar>
                                                ))}
                                            </AvatarGroup>
                                            <div className="text-[11px] md:text-sm font-medium text-text-muted">
                                                <span className="text-text font-bold">500+</span> trust us
                                            </div>
                                        </div>

                                        <Sheet open={isSharing} onOpenChange={setIsSharing} defaultOpen={false}>
                                            <SheetTrigger asChild>
                                                <button className="flex items-center gap-2 text-[11px] md:text-sm font-bold text-primary hover:text-primary-dark transition-all group">
                                                    <PenLine className="w-3.5 h-3.5 transition-transform group-hover:-rotate-12" />
                                                    <span className="border-b-[1.5px] border-primary/20 group-hover:border-primary pb-0.5">Share your story</span>
                                                </button>
                                            </SheetTrigger>
                                            <SheetContent open={isSharing}>
                                                <SheetHeader className="mb-6">
                                                    <SheetTitle className="text-2xl">Share your Story</SheetTitle>
                                                    <SheetDescription className="text-sm">
                                                        We love hearing from our community.
                                                    </SheetDescription>
                                                </SheetHeader>

                                                <div className="flex-1 flex flex-col gap-5 mt-2">
                                                    <div className="space-y-1.5">
                                                        <label htmlFor="name" className="text-[11px] font-bold text-text ml-1 uppercase tracking-widest opacity-50">Your Name</label>
                                                        <input
                                                            id="name"
                                                            className="w-full rounded-xl border-2 border-secondary bg-[#FAFAFA] px-4 py-3 text-sm transition-all focus:border-primary/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 placeholder:text-text-muted/40"
                                                            placeholder="Enter your name"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label htmlFor="salon" className="text-[11px] font-bold text-text ml-1 uppercase tracking-widest opacity-50">Salon Name</label>
                                                        <input
                                                            id="salon"
                                                            className="w-full rounded-xl border-2 border-secondary bg-[#FAFAFA] px-4 py-3 text-sm transition-all focus:border-primary/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 placeholder:text-text-muted/40"
                                                            placeholder="Your salon name"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5 flex-1">
                                                        <label htmlFor="content" className="text-[11px] font-bold text-text ml-1 uppercase tracking-widest opacity-50">Your Story</label>
                                                        <textarea
                                                            id="content"
                                                            className="w-full h-32 rounded-xl border-2 border-secondary bg-[#FAFAFA] px-4 py-3 text-sm transition-all focus:border-primary/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 placeholder:text-text-muted/40 resize-none"
                                                            placeholder="Tell us about your experience..."
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => setIsSharing(false)}
                                                        className="w-full py-4 bg-primary text-white text-base font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-[0.98] mt-auto mb-2"
                                                    >
                                                        Send Testimonial
                                                    </button>
                                                </div>
                                            </SheetContent>
                                        </Sheet>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Side: Cards */}
                    <div className="lg:w-2/3 w-full">
                        <div
                            ref={scrollRef}
                            className="flex gap-8 overflow-x-auto pt-10 pb-8 scrollbar-hide snap-x snap-mandatory"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {testimonials.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex-shrink-0 w-full sm:w-[350px] snap-start"
                                >
                                    {/* Testimonial Card */}
                                    <div className="flex flex-col gap-3 px-2">
                                        <div className="bg-white px-5 md:px-6 pt-10 md:pt-10 pb-6 md:pb-8 rounded-2xl shadow-[0_15px_35px_-12px_rgba(0,0,0,0.08)] border border-border/30 relative flex flex-col items-center text-center group transition-all duration-300 hover:shadow-[0_20px_45px_-12px_rgba(184,92,92,0.15)]">
                                            {/* Top Profile Image */}
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-[4px] border-[#F9F6F3] shadow-sm overflow-hidden">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            <div className="space-y-4 w-full">
                                                <p className="text-[13px] md:text-base text-text/80 leading-relaxed font-medium">
                                                    {item.content}
                                                </p>

                                                <div className="w-full h-px bg-border/40" />

                                                <h4 className="text-xl font-normal text-text" style={{ fontFamily: "'Dancing Script', cursive" }}>
                                                    {item.name}
                                                </h4>
                                            </div>
                                        </div>

                                        {/* Stars Box Below */}
                                        <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-border/40 flex justify-center gap-1 shadow-sm">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="w-4 h-4 fill-text text-text" />
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
