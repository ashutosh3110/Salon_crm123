import { motion } from 'framer-motion';
import { Mail, ArrowRight } from 'lucide-react';
import {
    PreviewLinkCard,
    PreviewLinkCardTrigger,
    PreviewLinkCardContent,
    PreviewLinkCardImage
} from '../ui/PreviewLinkCard';

export default function ContactPreview() {
    return (
        <section className="py-12 bg-background border-t border-border/50">
            <div className="max-w-3xl mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-4"
                >
                    <h2 className="text-xl md:text-2xl font-bold text-text">
                        Ready to transform your salon experience?
                    </h2>

                    <p className="text-text-secondary text-base max-w-xl mx-auto leading-relaxed">
                        Join hundreds of successful salons growing with our platform.
                    </p>

                    <div className="pt-2">
                        <PreviewLinkCard>
                            <PreviewLinkCardTrigger asChild>
                                <a
                                    href="#contact"
                                    className="group relative inline-flex items-center gap-2 text-lg font-bold text-primary transition-all hover:text-primary-dark"
                                >
                                    <span className="relative">
                                        Get in touch with us
                                        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary origin-left scale-x-100 group-hover:scale-x-110 transition-transform duration-300" />
                                    </span>
                                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                                </a>
                            </PreviewLinkCardTrigger>

                            <PreviewLinkCardContent>
                                <PreviewLinkCardImage
                                    src="/2-removebg-preview.png"
                                    alt="SalonCRM Support"
                                    className="bg-primary/5 p-4"
                                />
                                <div className="p-3">
                                    <h4 className="text-xs font-bold text-text">Our Support Team</h4>
                                    <p className="text-[10px] text-text-secondary">Average response time: &lt; 2 hours</p>
                                </div>
                            </PreviewLinkCardContent>
                        </PreviewLinkCard>
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-3 text-xs text-text-muted">
                        <Mail className="w-3.5 h-3.5" />
                        <span>hello@saloncrm.in</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
