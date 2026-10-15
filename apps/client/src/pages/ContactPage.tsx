import { useState } from "react";
import { 
  Mail, 
  MapPin, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Send, 
  Sparkles, 
  Clock, 
  MessageSquare,
  ArrowUpRight,
  CheckCircle2,
  PhoneCall
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useAttarSEO, ATTAR_SEO } from "@/lib/attar-seo";

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  useAttarSEO(ATTAR_SEO.contact.title, ATTAR_SEO.contact.desc, { canonical: "/contact" });
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const subject = encodeURIComponent(form.subject || "Private Concierge Inquiry — Attar House Nepal");
    const body = encodeURIComponent(
      `Patron Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`
    );

    setTimeout(() => {
      window.location.href = `mailto:concierge@ayeshafragrances.com?subject=${subject}&body=${body}`;
      setIsSubmitting(false);
      setSubmitted(true);
      toast({ 
        title: "Concierge Portal Connected",
        description: "Opening secure mail client to reach the Attar House Nepal team...",
      });
    }, 600);
  };

  const inputClasses =
    "w-full rounded-2xl border border-neutral-300 bg-white/95 px-5 py-3.5 text-sm font-sans text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#C5A265] focus:ring-4 focus:ring-[#C5A265]/10 transition-all duration-300 shadow-xs";

  return (
    <div className="relative pt-36 lg:pt-40 pb-28 bg-[#FAF8F5] text-neutral-900 min-h-screen overflow-hidden selection:bg-[#C5A265]/20 selection:text-neutral-900">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#C5A265_0.6px,transparent_0.6px)] [background-size:28px_28px] opacity-15" />
        <div className="absolute -right-20 top-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#C5A265]/15 via-transparent to-transparent blur-[140px]" />
        <div className="absolute -left-20 bottom-10 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#C5A265]/10 via-[#C5A265]/5 to-transparent blur-[150px]" />
      </div>

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10 max-w-6xl">
        
        {/* Header Section */}
        <div className="mb-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C5A265]/10 border border-[#C5A265]/30 font-mono text-[10px] uppercase tracking-[0.25em] text-[#8C6D37]">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A265]" />
            <span>Private Client Relations</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-neutral-950 tracking-tight leading-tight">
            Contact <br />
            <span className="italic font-light text-[#8C6D37]">Attar House Nepal</span>
          </h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-neutral-600 text-base md:text-lg font-light leading-relaxed !mt-3"
          >
            Whether seeking attar recommendations, help choosing sizes and discovery sets, or help with an order, our team is at your service.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 p-8 sm:p-10 rounded-3xl border border-neutral-200 bg-white/95 backdrop-blur-md shadow-xl relative"
          >
            <div className="flex items-center gap-2 mb-8 pb-4 border-b border-neutral-200">
              <MessageSquare className="w-4 h-4 text-[#8C6D37]" />
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-700 font-semibold">
                Private Inquiries Portal
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider mb-2 font-medium text-neutral-600">
                    Patron Full Name <span className="text-[#8C6D37]">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={handleChange("name")}
                    className={inputClasses}
                    placeholder="e.g. Lady Vivienne Montgomery"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider mb-2 font-medium text-neutral-600">
                    Email Address <span className="text-[#8C6D37]">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
                    className={inputClasses}
                    placeholder="patron@domain.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider mb-2 font-medium text-neutral-600">
                  Subject / Nature of Inquiry
                </label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={handleChange("subject")}
                  className={inputClasses}
                  placeholder="Attar Advisory / Gifting / Bulk Order"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider mb-2 font-medium text-neutral-600">
                  Your Message <span className="text-[#8C6D37]">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={handleChange("message")}
                  className={`${inputClasses} resize-none`}
                  placeholder="Detail your request, preferred fragrance notes, or event timeline..."
                />
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-4 rounded-full bg-neutral-950 text-white font-mono text-xs uppercase tracking-widest hover:bg-[#C5A265] transition-colors duration-300 shadow-md group disabled:opacity-50 cursor-pointer"
              >
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.span 
                      key="submitted"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="inline-flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Inquiry Dispatched
                    </motion.span>
                  ) : (
                    <motion.span 
                      key="send"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="inline-flex items-center gap-2"
                    >
                      <span>{isSubmitting ? "Transmitting..." : "Send to Concierge"}</span>
                      <Send className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </form>
          </motion.div>

          {/* Info Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 space-y-6"
          >
            {/* Direct Channels Card */}
            <div className="p-8 rounded-3xl border border-neutral-200 bg-white/95 backdrop-blur-md shadow-xl space-y-7">
              <div className="flex items-center gap-2 border-b border-neutral-200 pb-4 text-[#8C6D37] font-mono text-xs uppercase tracking-widest font-semibold">
                <Sparkles className="w-4 h-4 text-[#C5A265]" />
                <span>Concierge Desks</span>
              </div>

              {/* Email Block */}
              <div className="flex items-start gap-4 group">
                <div className="w-11 h-11 rounded-2xl bg-[#C5A265]/10 border border-[#C5A265]/30 flex items-center justify-center shrink-0 text-[#8C6D37] transition-colors duration-300 group-hover:bg-[#C5A265]/20">
                  <Mail className="w-5 h-5 text-[#C5A265]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-medium">
                    Private Concierge
                  </h3>
                  <a
                    href="mailto:concierge@ayeshafragrances.com"
                    className="inline-flex items-center gap-1 text-base font-serif text-neutral-900 hover:text-[#8C6D37] transition-colors font-normal"
                  >
                    <span>concierge@ayeshafragrances.com</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </a>
                </div>
              </div>

              {/* Atelier Locations */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#C5A265]/10 border border-[#C5A265]/30 flex items-center justify-center shrink-0 text-[#8C6D37]">
                  <MapPin className="w-5 h-5 text-[#C5A265]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-medium">
                    Visit & Call Us
                  </h3>
                  <p className="text-sm font-serif text-neutral-900 font-normal leading-relaxed">
                    Kathmandu, Nepal
                  </p>
                  <p className="text-xs text-neutral-500 font-light">Attar House Nepal · Importer & Retailer</p>
                  <div className="flex flex-wrap gap-3 pt-1">
                    <a href="tel:+9779869348963" className="font-mono text-[11px] uppercase tracking-widest text-[#8C6D37] underline underline-offset-4">+977 9869348963</a>
                    <a href="tel:+9779823521296" className="font-mono text-[11px] uppercase tracking-widest text-[#8C6D37] underline underline-offset-4">+977 9823521296</a>
                  </div>
                </div>
              </div>

              {/* Response Time Indicator */}
              <div className="flex items-start gap-4 pt-2 border-t border-neutral-200">
                <div className="w-11 h-11 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 text-neutral-600">
                  <Clock className="w-5 h-5 text-[#C5A265]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-medium">
                    Response Time
                  </h3>
                  <p className="text-xs text-neutral-600 font-light leading-relaxed">
                    Write to us any time — we reply to every message as soon as we can.
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links Block */}
            <div className="p-8 rounded-3xl border border-neutral-200 bg-white/95 backdrop-blur-md shadow-xl space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-medium">
                Follow Us
              </h3>
              
              <div className="flex items-center gap-3">
                {[
                  {
                    name: "Instagram",
                    href: "https://www.instagram.com",
                    icon: Instagram,
                  },
                  {
                    name: "Facebook",
                    href: "https://www.facebook.com",
                    icon: Facebook,
                  },
                  {
                    name: "LinkedIn",
                    href: "https://www.linkedin.com",
                    icon: Linkedin,
                  },
                ].map((social) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.name}
                      whileHover={{ y: -3, scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-11 h-11 rounded-2xl border border-neutral-200 bg-neutral-50 flex items-center justify-center text-neutral-700 hover:text-[#8C6D37] hover:border-[#C5A265]/50 hover:bg-[#C5A265]/10 transition-all duration-300"
                    >
                      <Icon className="w-4 h-4" />
                    </motion.a>
                  );
                })}
              </div>
            </div>

          </motion.div>

        </div>

      </div>
    </div>
  );
}