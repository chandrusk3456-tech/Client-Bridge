import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Video, Check, HelpCircle, Sparkles } from 'lucide-react';
import Button from '../../components/common/Button';

export const Services = () => {
  const webServices = [
    {
      title: 'Full-Stack MERN Application',
      price: 'Starting at ₹10,000',
      description: 'Production-ready database systems, secure admin panels, real-time client views, and clean state integrations.',
      features: ['React.js & Tailwind CSS', 'Node.js & Express API', 'MongoDB Schema & Indexing', 'JWT Authentication & Security', 'Third-party integrations'],
    },
    {
      title: 'Premium Landing Page',
      price: 'Starting at ₹5,000',
      description: 'High-conversion sales layouts, SEO optimization, responsive layout blocks, and Framer Motion micro-animations.',
      features: ['Optimized Lighthouse Score 95+', 'Fully Responsive Mobile Design', 'Google Analytics setup', 'Contact Form API integration', 'Fast loading times'],
    },
    {
      title: 'Custom Client Dashboard',
      price: 'Starting at ₹15,000',
      description: 'Visual analytics portals, widgets, user role management pipelines, invoice creators, and chat logs.',
      features: ['Role-Based Access Control', 'Interactive Chart.js modules', 'File sharing & Storage integrations', 'CSV/PDF exports', 'Real-time alert notifications'],
    },
  ];

  const videoServices = [
    {
      title: 'High-Retention YouTube Edits',
      price: 'Starting at ₹8,000 / video',
      description: 'Retention-optimized pacing, sound effects overlays, stock footage inserts, B-roll framing, and engaging intro graphics.',
      features: ['Dynamic intro pacing hook', 'Color-graded visual timeline', 'Sound effects & SFX tuning', 'Engaging subtitle popups', 'Revision support cycle'],
    },
    {
      title: 'Short Form Reels & Shorts',
      price: 'Starting at ₹3,000 / clip',
      description: 'Fast-paced Instagram reels, TikTok edits, or YouTube shorts with visual zoom effects and text layouts.',
      features: ['TikTok & Reels geofitting (9:16)', 'Highly engaging caption loops', 'Trending audio matching', 'Motion stickers & graphic inserts', 'Optimized first 3 seconds hook'],
    },
    {
      title: 'Promotional Branding Clips',
      price: 'Starting at ₹20,000 / video',
      description: 'Clean product showcases, commercial overlays, custom motion graphics transitions, and studio-grade audio overlays.',
      features: ['Product design layouts', 'Motion graphic typography', 'Voiceover audio cleaning', 'Multi-platform aspect ratios', 'Extended commercial licensing'],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24">
        <span className="text-xs uppercase tracking-widest text-secondary font-bold mb-2 block">Our Expertise</span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-primary">Services & Pricing</h1>
        <p className="text-slate-500 text-sm md:text-base mt-4 leading-relaxed">
          Select a baseline package structure and customize it dynamically during the project kickoff phase in your dashboard.
        </p>
      </div>

      {/* Web Development Section */}
      <section className="mb-20 md:mb-32">
        <div className="flex items-center gap-3 mb-10 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <Terminal className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">Web Engineering Services</h2>
            <p className="text-xs text-slate-400 mt-0.5">Custom software, dashboards, and APIs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {webServices.map((service, idx) => (
            <div
              key={idx}
              className="glass-card rounded-2xl p-6 border-slate-200/50 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-semibold text-secondary bg-secondary/5 px-2.5 py-1 rounded-lg border border-secondary/10 inline-block mb-4">
                  {service.price}
                </span>
                <h3 className="text-xl font-bold text-slate-800">{service.title}</h3>
                <p className="text-slate-500 text-xs mt-2.5 leading-relaxed">{service.description}</p>
                <div className="border-t border-slate-100 my-5" />
                <ul className="space-y-2">
                  {service.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2 text-xs text-slate-600">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-6">
                <Link to="/login" className="block">
                  <Button variant="primary" className="w-full text-xs py-2">
                    Request Proposal
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Video Editing Section */}
      <section className="mb-20 md:mb-32">
        <div className="flex items-center gap-3 mb-10 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center">
            <Video className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">Video Editing & Motion Graphics</h2>
            <p className="text-xs text-slate-400 mt-0.5">High-retention editing, sound design, and color grading</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {videoServices.map((service, idx) => (
            <div
              key={idx}
              className="glass-card rounded-2xl p-6 border-slate-200/50 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-semibold text-accent bg-accent/5 px-2.5 py-1 rounded-lg border border-accent/10 inline-block mb-4">
                  {service.price}
                </span>
                <h3 className="text-xl font-bold text-slate-800">{service.title}</h3>
                <p className="text-slate-500 text-xs mt-2.5 leading-relaxed">{service.description}</p>
                <div className="border-t border-slate-100 my-5" />
                <ul className="space-y-2">
                  {service.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2 text-xs text-slate-600">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-6">
                <Link to="/login" className="block">
                  <Button variant="primary" className="w-full text-xs py-2">
                    Request Proposal
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto mt-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-4xl font-extrabold text-slate-800">Frequently Asked Questions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { q: 'How long does a web development project take?', a: 'Typically, landing pages are completed within 7-10 days, while custom MERN dashboards and complex SaaS platforms take between 4 to 6 weeks, structured across set milestones.' },
            { q: 'Can I track revisions on video editing projects?', a: 'Absolutely. We upload review drafts directly inside the Client Dashboard. You can leave feedback and chat directly to implement revisions.' },
            { q: 'What payment schedules are offered?', a: 'Standard projects require a 30% kickoff deposit, followed by milestone clearing payments, and a final 20% due upon review validation.' },
            { q: 'Is hosting and domain setup included?', a: 'Yes, we assist with routing, configuring domain settings, SSL validation, and deployment to high-speed platforms (Vercel, Render, AWS).' },
          ].map((faq, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-6">
              <div className="flex gap-2.5 items-start">
                <HelpCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{faq.q}</h4>
                  <p className="text-slate-500 text-xs mt-2 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Services;
