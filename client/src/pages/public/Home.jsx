import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Terminal, Video, ArrowRight, CheckCircle2, Trophy, Clock, HeartHandshake } from 'lucide-react';
import Button from '../../components/common/Button';

export const Home = () => {
  const [stats, setStats] = useState({ projects: 0, revenue: 0, satisfaction: 0 });

  // Simulate counter increments for nice dynamic landing feel
  useEffect(() => {
    const interval = setTimeout(() => {
      setStats({ projects: 48, revenue: 98, satisfaction: 100 });
    }, 400);
    return () => clearTimeout(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } },
  };

  return (
    <div className="relative pb-24 overflow-hidden">
      
      {/* Glow Rings background */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute top-80 left-[10%] w-[350px] h-[350px] bg-accent/5 rounded-full blur-3xl -z-10" />

      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 pt-16 md:pt-28 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-semibold mb-6 border border-secondary/20 hover:bg-secondary/15 transition-colors"
        >
          <Sparkles className="w-4.5 h-4.5 text-accent animate-pulse" />
          <span>Bridging Ideas into Digital Solutions</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-7xl font-extrabold max-w-4xl leading-[1.15] text-primary"
        >
          Professional Web Development & Cinematic <span className="text-gradient">Video Editing</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-slate-500 text-lg md:text-xl max-w-2xl mt-6 leading-relaxed"
        >
          High-performance full-stack MERN engineering paired with premium motion design and video assets. Establishes your digital brand, conversions, and online ecosystem.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mt-10 w-full justify-center px-4"
        >
          <Link to="/services">
            <Button size="lg" variant="primary" className="w-full sm:w-auto shadow-lg shadow-primary/20">
              Browse Services
            </Button>
          </Link>
          <Link to="/portfolio">
            <Button size="lg" variant="outline" className="w-full sm:w-auto glass-card">
              View Work
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="max-w-7xl mx-auto px-6 mt-20 md:mt-32">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: 'Completed Deliveries', val: `${stats.projects}+`, desc: 'Web apps & promo edits', icon: <Trophy className="text-secondary" /> },
            { label: 'Client Satisfaction', val: `${stats.satisfaction}%`, desc: 'Based on global client reviews', icon: <HeartHandshake className="text-accent" /> },
            { label: 'Speed Guarantee', val: `${stats.revenue}%`, desc: 'On-time milestone compliance', icon: <Clock className="text-highlight" /> },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 flex items-center gap-4 hover:scale-[1.02] transition-all duration-200 border-slate-200/50"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-extrabold text-slate-800">{stat.val}</p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{stat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. SERVICES HIGHLIGHT */}
      <section className="max-w-7xl mx-auto px-6 mt-28 md:mt-44">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-primary">Services Offered</h2>
          <p className="text-slate-500 text-sm md:text-base mt-3 max-w-xl mx-auto">
            High-caliber skillsets engineered for scalability, conversions, and visual superiority.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Dev Service Card */}
          <motion.div
            whileHover={{ y: -6 }}
            className="glass-card rounded-3xl p-8 md:p-10 border-slate-200/50 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl" />
            <div>
              <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <Terminal className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-800">Web Engineering</h3>
              <p className="text-slate-500 text-sm leading-relaxed mt-3">
                End-to-end full-stack MERN applications, customized SaaS portals, interactive client dashboards, third-party API integrations, and robust database migrations.
              </p>
              <ul className="mt-6 space-y-2.5">
                {['Single-page React dashboards', 'Node/Express REST APIs', 'MDB Database modeling', 'Razorpay Gateway checkout integrations'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link to="/services" className="mt-8 block">
              <Button variant="outline" size="md" className="w-full">
                Explore Tech Details
              </Button>
            </Link>
          </motion.div>

          {/* Video Edit Service Card */}
          <motion.div
            whileHover={{ y: -6 }}
            className="glass-card rounded-3xl p-8 md:p-10 border-slate-200/50 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl" />
            <div>
              <div className="w-14 h-14 bg-cyan-50 border border-cyan-100 rounded-2xl flex items-center justify-center mb-6">
                <Video className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-800">Cinematic Video Editing</h3>
              <p className="text-slate-500 text-sm leading-relaxed mt-3">
                High-impact YouTube timelines, YouTube shorts and Instagram reels layouts, corporate promotional campaigns, dynamic motion graphics, and audio/color correction.
              </p>
              <ul className="mt-6 space-y-2.5">
                {['Premium Motion Graphics design', 'High retention reels formats', 'Color grading & sound design', 'Corporate brand promo reels'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link to="/services" className="mt-8 block">
              <Button variant="outline" size="md" className="w-full">
                Explore Creative Formats
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 4. FEATURED CASE STUDY - PIZZA PALACE */}
      <section className="max-w-7xl mx-auto px-6 mt-28 md:mt-44 bg-gradient-mesh rounded-3xl p-8 md:p-14 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px]" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <span className="text-xs uppercase tracking-widest text-accent font-extrabold bg-accent/15 px-3 py-1 rounded-full border border-accent/20 inline-block">
              Featured Case Study
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">Pizza Palace Ordering Platform</h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              A bespoke full-stack online food dispatch management system and client dashboard created for a luxury pizzeria franchise, cutting aggregator margins completely.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Socket.io'].map((tech) => (
                <span key={tech} className="bg-white/10 text-white border border-white/10 px-2.5 py-1 rounded-lg text-xs font-medium">
                  {tech}
                </span>
              ))}
            </div>
            <div className="pt-4">
              <Link to="/portfolio/pizza-palace">
                <Button variant="accent" size="lg" icon={<ArrowRight className="w-4.5 h-4.5" />}>
                  Inspect Case Study
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-video group">
            <img
              src="https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop"
              alt="Pizza Palace Showcase"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* 5. PROCESS TIMELINE */}
      <section className="max-w-7xl mx-auto px-6 mt-28 md:mt-44">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-primary">Process Timeline</h2>
          <p className="text-slate-500 text-sm md:text-base mt-3 max-w-xl mx-auto">
            From initial proposal to deployed solutions, mapped completely inside your client dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {[
            { num: '01', title: 'Submit Request', desc: 'Detail your scope, timeline target, and budget parameters in our client dashboard.' },
            { num: '02', title: 'Quote Received', desc: 'Get a formal budget quote, payment schedule, and developmental milestones within 24 hours.' },
            { num: '03', title: 'Secure Payment', desc: 'Accept the quote and clear the kickoff invoice securely powered by Razorpay.' },
            { num: '04', title: 'Launch & Track', desc: 'Observe milestone completions in real-time, message in chat, and download deliverables.' },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-white border border-slate-100 rounded-2xl p-6 relative hover:shadow-md transition-shadow duration-200"
            >
              <span className="text-3xl md:text-4xl font-extrabold text-slate-200 absolute top-4 right-4 font-mono">
                {step.num}
              </span>
              <h3 className="text-lg font-bold text-slate-800 mt-2">{step.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed mt-2.5">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
