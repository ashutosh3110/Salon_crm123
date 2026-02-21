import { useState } from 'react';
import { Send, Mail, Phone, MapPin } from 'lucide-react';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        salonName: '',
        message: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Future: integrate with backend / email service
        alert('Thank you! We will get back to you within 24 hours.');
        setFormData({ name: '', email: '', phone: '', salonName: '', message: '' });
    };

    return (
        <section id="contact" className="py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16">
                    {/* Left — Info */}
                    <div>
                        <span className="text-sm font-semibold text-primary tracking-wide uppercase">
                            Get in Touch
                        </span>
                        <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-text">
                            Ready to Transform<br />Your Salon?
                        </h2>
                        <p className="mt-6 text-text-secondary leading-relaxed">
                            Request a demo, ask a question, or just say hello.
                            Our team is here to help you get started.
                        </p>

                        <div className="mt-10 space-y-6">
                            {[
                                { icon: Mail, label: 'Email', value: 'hello@saloncrm.in' },
                                { icon: Phone, label: 'Phone', value: '+91 98765 43210' },
                                { icon: MapPin, label: 'Office', value: 'Ahmedabad, Gujarat, India' },
                            ].map((item) => (
                                <div key={item.label} className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        <item.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-text-muted">{item.label}</div>
                                        <div className="text-text font-medium">{item.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right — Form */}
                    <div className="bg-surface rounded-2xl p-8 border border-border">
                        <h3 className="text-lg font-bold text-text mb-6">Request a Demo</h3>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-text placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-text placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-text placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                        Salon Name
                                    </label>
                                    <input
                                        type="text"
                                        name="salonName"
                                        value={formData.salonName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-text placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                                        placeholder="Your Salon"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                    Message
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-text placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
                                    placeholder="Tell us about your salon and what you need..."
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn-primary inline-flex items-center gap-2 w-full justify-center py-3"
                            >
                                <Send className="w-4 h-4" />
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
