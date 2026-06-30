import React, { useState, useEffect } from 'react';
import { Terminal, Video, ExternalLink, Github, Sparkles } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import SkeletonLoader from '../../components/common/SkeletonLoader';

export const Portfolio = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);
      try {
        let url = '/api/portfolio';
        if (categoryFilter !== 'all') {
          url += `?category=${categoryFilter}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setProjects(data.projects);
        }
      } catch (err) {
        console.error('Error fetching portfolio:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [categoryFilter]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs uppercase tracking-widest text-secondary font-bold mb-2 block">Case Studies</span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-primary">Featured Portfolio</h1>
        <p className="text-slate-500 text-sm md:text-base mt-4 leading-relaxed">
          Explore production-grade platforms and cinematic video layouts created for clients worldwide.
        </p>
      </div>

      {/* Category Filter Chips */}
      <div className="flex justify-center gap-3 mb-16">
        {[
          { label: 'All Projects', value: 'all' },
          { label: 'Web Apps', value: 'web_development' },
          { label: 'Video Edits', value: 'video_editing' },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setCategoryFilter(filter.value)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              categoryFilter === filter.value
                ? 'bg-primary text-white border-primary shadow-md'
                : 'bg-white text-slate-500 border-slate-200/60 hover:text-primary hover:border-slate-300'
            }`}
          >
            {filter.value === 'web_development' ? (
              <Terminal className="w-3.5 h-3.5 inline mr-1.5" />
            ) : filter.value === 'video_editing' ? (
              <Video className="w-3.5 h-3.5 inline mr-1.5" />
            ) : null}
            {filter.label}
          </button>
        ))}
      </div>

      {/* Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {loading ? (
          <SkeletonLoader type="card" count={2} />
        ) : projects.length > 0 ? (
          projects.map((proj) => (
            <div
              key={proj._id}
              onClick={() => setSelectedProject(proj)}
              className="glass-card rounded-2xl overflow-hidden border-slate-200/50 hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="aspect-video relative overflow-hidden bg-slate-100">
                  <img
                    src={proj.coverImage}
                    alt={proj.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                  {proj.isFeatured && (
                    <span className="absolute top-4 left-4 bg-gradient-to-r from-secondary to-accent text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md shadow">
                      Featured Work
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex gap-2 mb-3">
                    {proj.technologies.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-semibold px-2 py-0.5 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                    {proj.technologies.length > 3 && (
                      <span className="text-[10px] text-slate-400 font-bold self-center">
                        +{proj.technologies.length - 3} more
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-slate-800 leading-tight">
                    {proj.title}
                  </h3>
                  <p className="text-slate-500 text-xs mt-2 leading-relaxed line-clamp-2">
                    {proj.description}
                  </p>
                </div>
              </div>
              <div className="p-6 pt-0 flex justify-between items-center text-xs font-bold text-secondary">
                <span>View Case Study</span>
                <span className="w-6 h-6 rounded-lg bg-slate-50 group-hover:bg-blue-50 flex items-center justify-center border border-slate-100 transition-colors">
                  →
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-20 text-slate-400 font-medium text-sm">
            No projects found in this category
          </div>
        )}
      </div>

      {/* Case Study Detail Modal */}
      {selectedProject && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedProject(null)}
          title={`${selectedProject.title} — Case Study`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-50">
              <img
                src={selectedProject.coverImage}
                alt={selectedProject.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-wrap gap-4 items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Client</span>
                <p className="text-sm font-bold text-slate-700">{selectedProject.clientName || 'Confidential'}</p>
              </div>
              <div className="flex gap-3">
                {selectedProject.liveUrl && (
                  <a href={selectedProject.liveUrl} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm" icon={<ExternalLink className="w-4 h-4" />}>
                      Live Project
                    </Button>
                  </a>
                )}
                {selectedProject.githubUrl && (
                  <a href={selectedProject.githubUrl} target="_blank" rel="noreferrer">
                    <Button variant="dark" size="sm" icon={<Github className="w-4 h-4" />}>
                      Codebase
                    </Button>
                  </a>
                )}
              </div>
            </div>

            {/* Problem & Solution block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-rose-500 mb-2">The Problem</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedProject.problem}</p>
              </div>
              <div>
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-emerald-500 mb-2">The Solution</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedProject.solution}</p>
              </div>
            </div>

            {/* Tech Stack used */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Technologies Leveraged</h4>
              <div className="flex flex-wrap gap-2">
                {selectedProject.technologies.map((tech) => (
                  <span key={tech} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-medium border border-slate-200/50">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Results achieved */}
            <div>
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 mb-3">Key Results & Achievements</h4>
              <ul className="space-y-2.5">
                {selectedProject.results.map((res, i) => (
                  <li key={i} className="flex gap-2 text-xs text-slate-600 items-start leading-relaxed">
                    <span className="w-5 h-5 bg-emerald-50 text-emerald-500 font-bold rounded flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span>{res}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Gallery Screenshots */}
            {selectedProject.gallery && selectedProject.gallery.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Project Screenshots</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {selectedProject.gallery.map((imgUrl, i) => (
                    <div key={i} className="rounded-xl overflow-hidden aspect-video border border-slate-100 bg-slate-50">
                      <img src={imgUrl} alt={`gallery-${i}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

    </div>
  );
};

export default Portfolio;
