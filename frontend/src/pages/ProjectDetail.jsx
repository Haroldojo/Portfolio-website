import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiExternalLink, FiGithub } from 'react-icons/fi';
import { getProjectDetail } from '../services/api';

const ProjectDetail = () => {
    const { slug } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await getProjectDetail(slug);
                setProject(res.data);
            } catch (err) {
                console.error("Error fetching project:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [slug]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background text-accent">
                <div className="animate-spin text-5xl italic font-black">P</div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="pt-40 pb-32">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-5xl font-black uppercase tracking-tighter mb-6">
                        PROJECT <span className="text-accent">NOT FOUND</span>
                    </h2>
                    <p className="text-textSecondary text-xl mb-12">
                        The project you're looking for doesn't exist or has been removed.
                    </p>
                    <Link to="/projects" className="btn-primary inline-flex items-center gap-2">
                        <FiArrowLeft /> BACK TO PROJECTS
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-40 pb-32">
            <div className="container mx-auto px-6">
                {/* Back Button */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-12"
                >
                    <Link
                        to="/projects"
                        className="inline-flex items-center gap-3 text-textSecondary hover:text-accent transition-colors font-bold uppercase tracking-widest text-sm"
                    >
                        <FiArrowLeft className="text-xl" /> Back to Projects
                    </Link>
                </motion.div>

                {/* Project Header */}
                <div className="flex flex-col lg:flex-row gap-16 mb-20">
                    {/* Thumbnail */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="lg:w-3/5"
                    >
                        <div className="aspect-video rounded-3xl overflow-hidden bg-secondary border border-border">
                            {project.thumbnail ? (
                                <img
                                    src={project.thumbnail}
                                    alt={project.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-accent text-opacity-20 font-black text-6xl italic">
                                    {project.title}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Project Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:w-2/5 flex flex-col justify-center"
                    >
                        <span className="bg-accent text-background text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest inline-block w-fit mb-6">
                            {project.category?.replace('_', ' ')}
                        </span>

                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">
                            {project.title}
                        </h1>

                        <p className="text-textSecondary text-lg leading-relaxed mb-10">
                            {project.description}
                        </p>

                        {/* Action Links */}
                        <div className="flex flex-wrap gap-4">
                            {project.project_url && (
                                <a
                                    href={project.project_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary flex items-center gap-2"
                                >
                                    LIVE DEMO <FiExternalLink />
                                </a>
                            )}
                            {project.github_url && (
                                <a
                                    href={project.github_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-outline flex items-center gap-2"
                                >
                                    SOURCE CODE <FiGithub />
                                </a>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Technologies */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-secondary p-10 md:p-16 rounded-[3rem] border border-border"
                >
                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-8">
                        TECH <span className="text-accent">STACK</span>
                    </h3>
                    <div className="flex flex-wrap gap-4">
                        {project.technologies?.map((tech) => (
                            <span
                                key={tech.id}
                                className="bg-background text-accent border border-border px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest hover:border-accent transition-all"
                            >
                                {tech.name}
                            </span>
                        ))}
                    </div>
                </motion.div>

                {/* Bottom CTA */}
                <div className="mt-20 text-center">
                    <Link to="/projects" className="btn-outline inline-flex items-center gap-2">
                        <FiArrowLeft /> VIEW ALL PROJECTS
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;
