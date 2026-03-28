import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard';
import { getProjects } from '../services/api';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(true);

    const categories = [
        { id: 'all', label: 'All Projects' },
        { id: 'web_app', label: 'Web Apps' },
        { id: 'ecommerce', label: 'E-commerce' },
        { id: 'ui_ux', label: 'UI/UX Design' },
        { id: 'open_source', label: 'Open Source' },
    ];

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            try {
                const res = await getProjects(activeTab);
                setProjects(res.data);
            } catch (error) {
                console.error("Error fetching projects:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, [activeTab]);

    return (
        <div className="pt-40 pb-32">
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="mb-20 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4"
                    >
                        SELECTED <span className="text-accent">WORKS</span>
                    </motion.h2>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: 100 }}
                        className="h-1 bg-accent mx-auto mb-8"
                    ></motion.div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-textSecondary text-xl max-w-2xl mx-auto"
                    >
                        A curated gallery of high-impact development projects, spanning across web applications, design systems, and creative experiments.
                    </motion.p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap justify-center gap-4 mb-20">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className={`px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === cat.id
                                    ? 'bg-accent text-background'
                                    : 'bg-secondary text-textSecondary hover:bg-card hover:text-textPrimary'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Project Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin text-5xl italic font-black text-accent">P</div>
                    </div>
                ) : (
                    <motion.div
                        layout
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        <AnimatePresence mode="popLayout">
                            {projects.map((project) => (
                                <ProjectCard key={project.id} project={project} />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Bottom CTA */}
                <div className="mt-40 bg-secondary p-12 md:p-20 rounded-[3rem] text-center border border-border">
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-8 max-w-2xl mx-auto">
                        Ready to start your <span className="text-accent italic">next</span> project?
                    </h2>
                    <div className="flex flex-wrap justify-center gap-6">
                        <Link to="/contact" className="btn-primary">GET IN TOUCH</Link>
                        <Link to="/resume" className="btn-outline">VIEW RESUME</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Projects;
