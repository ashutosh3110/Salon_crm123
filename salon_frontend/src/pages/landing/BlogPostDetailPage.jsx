import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';

const blogPosts = [
    {
        id: 1,
        category: "Growth",
        title: "How to Scale Your Salon to Multiple Outlets",
        content: `
            <p>Scaling a salon business is an exhilarating journey, but it requires more than just passion—it requires a robust operational blueprint. When moving from a single boutique to a multi-outlet empire, consistency becomes your most valuable currency.</p>
            <h3>1. Standardize Your Service Menu</h3>
            <p>Whether a client walks into your original branch or your tenth location, the experience must be identical. This means standardized training for all stylists, unified product lines, and a consistent color palette in your interior design.</p>
            <h3>2. Centralize Your Management</h3>
            <p>Using a cloud-based CRM allows you to monitor performance across all branches from a single dashboard. You can track inventory levels, staff attendance, and revenue in real-time without having to be physically present at every location.</p>
            <h3>3. Empower Local Leaders</h3>
            <p>As you grow, you cannot micro-manage every detail. Hiring salon managers who share your vision and giving them the tools to succeed is crucial for sustainable scaling.</p>
        `,
        image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1200",
        date: "Feb 15, 2026",
        author: "Sophia Laurent"
    },
    {
        id: 2,
        category: "Marketing",
        title: "Automated WhatsApp Marketing for Beauty Businesses",
        content: `
            <p>In today's digital age, your clients' attention is held within their messaging apps. WhatsApp has emerged as the most powerful tool for customer retention in the beauty industry.</p>
            <h3>The Power of Instant Connection</h3>
            <p>Automated reminders reduce no-shows by up to 60%. But marketing goes beyond just reminders. You can send personalized birthday offers, loyalty point updates, and seasonal campaign galleries directly to their pockets.</p>
            <h3>Segmenting Your Audience</h3>
            <p>Don't just blast messages. Use your CRM data to target clients based on their visit history. Send haircare tips to those who just got a color service, or a special discount to those who haven't visited in 60 days.</p>
        `,
        image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=1200",
        date: "Feb 10, 2026",
        author: "Marcus Chen"
    },
    {
        id: 3,
        category: "Operations",
        title: "The Future of POS in the Salon Industry",
        content: `
            <p>The traditional cash register is a relic of the past. Modern salon owners are looking for integrated ecosystems that handle every aspect of the transaction and beyond.</p>
            <h3>Beyond Simple Billing</h3>
            <p>A modern POS system should integrate with your inventory, staff commissions, and loyalty programs. When a client pays, the system should automatically deduct products used, calculate the stylist's cut, and update the client's reward balance.</p>
            <h3>The Cloud Advantage</h3>
            <p>Accessing your financial data from anywhere is no longer a luxury—it's a necessity. Real-time reporting allows you to make data-driven decisions on the fly, ensuring your salon remains profitable and competitive.</p>
        `,
        image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80&w=1200",
        date: "Feb 05, 2026",
        author: "Emma Richards"
    }
];

export default function BlogPostDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const post = blogPosts.find(p => p.id === parseInt(id));

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDF9F8]">
                <div className="text-center">
                    <h2 className="text-2xl font-serif italic mb-4">Article Not Found</h2>
                    <button onClick={() => navigate('/blog')} className="text-primary font-bold uppercase tracking-widest text-xs border-b border-primary">
                        Return to Journal
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDF9F8] flex flex-col">
            <Navbar />

            {/* Elegant Header - Matching Journal Style */}
            <div className="bg-[#4A1D28] pt-32 pb-20 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 px-4 max-w-4xl mx-auto"
                >
                    <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-[0.4em] mb-4 block">
                        {post.category} Journal
                    </span>
                    <h1 className="text-3xl md:text-5xl font-serif italic text-white leading-tight mb-6">
                        {post.title}
                    </h1>
                    <div className="flex items-center justify-center gap-6 text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">
                        <span>By {post.author}</span>
                        <div className="h-4 w-[1px] bg-white/20" />
                        <span>{post.date}</span>
                    </div>
                </motion.div>
            </div>

            {/* Content Area */}
            <main className="flex-1 max-w-7xl mx-auto px-4 py-20 w-full">
                <div className="grid lg:grid-cols-12 gap-12 items-start">

                    {/* Left Decorative Column */}
                    <div className="hidden lg:block lg:col-span-2 sticky top-32">
                        <div className="aspect-[2/3] rounded-t-full overflow-hidden border border-black/5 shadow-xl grayscale">
                            <img src={post.image} alt="Artistic" className="w-full h-full object-cover" />
                        </div>
                        <div className="mt-8 text-center">
                            <h3 className="font-serif italic text-xl text-primary">Vision 01</h3>
                        </div>
                    </div>

                    {/* Main Article Content */}
                    <div className="lg:col-span-8 bg-white p-8 md:p-16 shadow-lg border border-black/5">
                        <div className="aspect-video overflow-hidden border border-black/5 mb-12">
                            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                        </div>

                        <div
                            className="prose prose-lg prose-slate max-w-none text-text-secondary leading-relaxed first-letter:text-5xl first-letter:font-serif first-letter:italic first-letter:text-primary first-letter:mr-3 first-letter:float-left"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        <div className="mt-20 pt-10 border-t border-black/5 flex justify-between items-center">
                            <button
                                onClick={() => navigate('/blog')}
                                className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-4 hover:gap-6 transition-all"
                            >
                                <span className="h-[1px] w-12 bg-primary" /> Back to Journal
                            </button>
                            <div className="flex gap-4">
                                {/* Share icons could go here */}
                                <div className="h-8 w-8 rounded-full border border-black/5 flex items-center justify-center hover:bg-[#4A1D28] hover:text-white transition-all cursor-pointer">
                                    <i className="fab fa-facebook-f text-xs" />
                                </div>
                                <div className="h-8 w-8 rounded-full border border-black/5 flex items-center justify-center hover:bg-[#4A1D28] hover:text-white transition-all cursor-pointer">
                                    <i className="fab fa-twitter text-xs" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Decorative Column */}
                    <div className="hidden lg:block lg:col-span-2 sticky top-32">
                        <div className="aspect-[2/3] rounded-b-full overflow-hidden border border-black/5 shadow-xl grayscale">
                            <img src="https://images.unsplash.com/photo-1522337660859-02fbefce4ffc?auto=format&fit=crop&q=80&w=800" alt="Artistic" className="w-full h-full object-cover" />
                        </div>
                        <div className="mt-8 text-center">
                            <h3 className="font-serif italic text-xl text-primary">Detail</h3>
                        </div>
                    </div>

                </div>
            </main>

            {/* Bottom Dark Section - Matching Ref */}
            <div className="bg-[#4A1D28] py-12 text-center">
                <h2 className="text-2xl font-serif italic text-[#D4AF37]">Explore More Insights</h2>
            </div>

            <Footer />
        </div>
    );
}
