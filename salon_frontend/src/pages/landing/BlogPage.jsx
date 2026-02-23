import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';

const blogPosts = [
    {
        id: 1,
        category: "Growth",
        title: "How to Scale Your Salon to Multiple Outlets",
        excerpt: "Learn the essential strategies for managing operations across different locations without losing quality.",
        image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800",
        date: "Feb 15, 2026"
    },
    {
        id: 2,
        category: "Marketing",
        title: "Automated WhatsApp Marketing for Beauty Businesses",
        excerpt: "Discover how automated reminders and campaigns can increase your booking rate by up to 40%.",
        image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=800",
        date: "Feb 10, 2026"
    },
    {
        id: 3,
        category: "Operations",
        title: "The Future of POS in the Salon Industry",
        excerpt: "Why traditional billing is dead and how modern cloud-based systems are changing the game.",
        image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80&w=800",
        date: "Feb 05, 2026"
    }
];

export default function BlogPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#FDF9F8] flex flex-col">
            <Navbar />

            {/* Elegant Header - Matching Ref */}
            <div className="bg-[#4A1D28] pt-32 pb-20 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 px-4"
                >
                    <h1 className="text-4xl md:text-6xl font-serif italic text-[#D4AF37] leading-tight">
                        Our Journal
                    </h1>
                    <div className="mt-4 flex items-center justify-center gap-4">
                        <div className="h-[1px] w-12 bg-[#D4AF37]/40" />
                        <span className="text-white/60 text-xs font-bold uppercase tracking-[0.3em]">Insights & Stories</span>
                        <div className="h-[1px] w-12 bg-[#D4AF37]/40" />
                    </div>
                </motion.div>
            </div>

            {/* Featured Post (Signature Style) */}
            <section className="max-w-7xl mx-auto px-4 py-20 w-full">
                <div className="grid lg:grid-cols-12 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        onClick={() => navigate('/blog/1')}
                        className="lg:col-span-12 group cursor-pointer"
                    >
                        <div className="relative aspect-[21/9] overflow-hidden border border-black/5 shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1522337660859-02fbefce4ffc?auto=format&fit=crop&q=80&w=1200"
                                alt="Featured Blog"
                                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                                <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-[0.4em] mb-4">Latest Insight</span>
                                <h2 onClick={() => navigate('/blog/1')} className="text-3xl md:text-5xl font-serif italic text-white max-w-3xl mb-6 cursor-pointer">
                                    The Art of Salon Experience: More Than Just a Service
                                </h2>
                                <button onClick={() => navigate('/blog/1')} className="border border-white/60 text-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-white hover:text-[#4A1D28] transition-all">
                                    Read Article
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Grid of Journal Posts */}
                <div className="mt-24 grid md:grid-cols-2 lg:grid-cols-12 gap-12 items-start">

                    {/* Left Decorative Image (From Ref) */}
                    <div className="hidden lg:block lg:col-span-3 sticky top-32">
                        <div className="aspect-[3/4] rounded-t-full overflow-hidden border border-black/5 shadow-xl">
                            <img
                                src="https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800"
                                alt="Journal Style"
                                className="w-full h-full object-cover grayscale"
                            />
                        </div>
                        <div className="mt-8 text-center">
                            <h3 className="font-serif italic text-2xl text-primary">Signature</h3>
                            <div className="bg-primary/20 h-0.5 w-8 mx-auto mt-2" />
                        </div>
                    </div>

                    {/* Blog Feed */}
                    <div className="lg:col-span-6 space-y-20">
                        {blogPosts.map((post, idx) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group pb-20 border-b border-black/5"
                            >
                                <span className="text-primary text-[10px] font-bold uppercase tracking-[0.3em] block mb-4">
                                    {post.category} — {post.date}
                                </span>
                                <h3
                                    onClick={() => navigate(`/blog/${post.id}`)}
                                    className="text-3xl font-serif italic text-text mb-4 group-hover:text-primary transition-colors cursor-pointer"
                                >
                                    {post.title}
                                </h3>
                                <p className="text-text-secondary leading-relaxed mb-8">
                                    {post.excerpt}
                                </p>
                                <div
                                    onClick={() => navigate(`/blog/${post.id}`)}
                                    className="aspect-video overflow-hidden border border-black/5 shadow-lg mb-8 cursor-pointer"
                                >
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                    />
                                </div>
                                <button
                                    onClick={() => navigate(`/blog/${post.id}`)}
                                    className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-4 group-hover:gap-6 transition-all"
                                >
                                    Continue Reading <span className="h-[1px] w-12 bg-primary" />
                                </button>
                            </motion.div>
                        ))}
                    </div>

                    {/* Right Decorative Section (From Ref) */}
                    <div className="hidden lg:block lg:col-span-3 sticky top-32">
                        <div className="mt-12 aspect-[3/4] rounded-b-full overflow-hidden border border-black/5 shadow-xl">
                            <img
                                src="https://images.unsplash.com/photo-1556742049-02e536952199?auto=format&fit=crop&q=80&w=800"
                                alt="Journal Style"
                                className="w-full h-full object-cover grayscale"
                            />
                        </div>
                        <div className="mt-8 text-center">
                            <h3 className="font-serif italic text-2xl text-primary">Perspective</h3>
                            <div className="bg-primary/20 h-0.5 w-8 mx-auto mt-2" />
                        </div>
                    </div>

                </div>
            </section>

            {/* Bottom Dark Section - Matching Ref */}
            <div className="bg-[#4A1D28] py-16 text-center">
                <span className="text-[#D4AF37]/60 text-xs font-bold uppercase tracking-[0.5em] mb-4 block">Subscribe</span>
                <h2 className="text-3xl md:text-5xl font-serif italic text-[#D4AF37]">Join the Salon Inner Circle</h2>
            </div>

            <Footer />
        </div>
    );
}
