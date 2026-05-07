import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle, ChevronDown } from 'lucide-react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';

const faqs = [
    {
        question: "How does the 14-day free trial work?",
        answer: "You get full access to all SalonCRM features for 14 days. No credit card is required to start. We'll notify you before your trial ends so you can choose a plan that fits your needs."
    },
    {
        question: "Can I manage multiple salon locations?",
        answer: "Yes! SalonCRM is designed for growth. You can easily add and manage multiple outlets from a single dashboard, with centralized reporting and staff management."
    },
    {
        question: "Is my customer data secure?",
        answer: "Absolutely. We use industry-standard encryption and secure cloud servers to ensure your data and your customers' information are always protected and private."
    },
    {
        question: "Can I migrate my data from another software?",
        answer: "We offer free data migration assistance. Our team will help you import your existing client lists, service menus, and booking history safely into SalonCRM."
    },
    {
        question: "Does SalonCRM work on mobile devices?",
        answer: "Yes, SalonCRM is fully responsive and works perfectly on tablets and smartphones. We also offer dedicated staff and client apps for the best mobile experience."
    }
];

const Accordion = AccordionPrimitive.Root;

const AccordionItem = ({ children, className, ...props }) => (
    <AccordionPrimitive.Item
        className={`border-b border-border ${className}`}
        {...props}
    >
        {children}
    </AccordionPrimitive.Item>
);

const AccordionTrigger = ({ children, className, ...props }) => (
    <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger
            className={`flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180 ${className}`}
            {...props}
        >
            {children}
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
        </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
);

const AccordionContent = ({ children, className, ...props }) => (
    <AccordionPrimitive.Content
        className={`overflow-hidden text-sm transition-all data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown ${className}`}
        {...props}
    >
        <div className="pb-4 pt-0">{children}</div>
    </AccordionPrimitive.Content>
);

export default function FAQ() {
    return (
        <section className="py-12 md:py-24 bg-background relative" id="faq">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8 md:mb-16">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text mb-3 md:mb-6">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-sm md:text-lg text-text-secondary">
                        Everything you need to know about SalonCRM.
                    </p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`} className="border-border/50">
                            <AccordionTrigger className="text-[13px] md:text-base font-semibold text-text hover:text-primary transition-colors no-underline hover:no-underline py-3 md:py-5">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-[12px] md:text-base text-text-secondary leading-relaxed">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
