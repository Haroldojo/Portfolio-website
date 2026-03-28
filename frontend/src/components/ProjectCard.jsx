import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowUpRight, FiGithub } from 'react-icons/fi';

const ProjectCard = ({ project }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-style group overflow-hidden"
        >
            <Link to={`/projects/${project.slug}`} className="block">
                <div className="relative aspect-video mb-6 overflow-hidden rounded-lg bg-secondary">
                    {project.thumbnail ? (
                        <img
                            src={project.thumbnail}
                            alt={project.title}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-accent text-opacity-30 font-black text-4xl italic">
                            PROJECT
                        </div>
                    )}
                    <div className="absolute top-4 right-4 bg-accent text-background text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest bg-opacity-90">
                        {project.category.replace('_', ' ')}
                    </div>
                </div>
            </Link>

            <div className="flex justify-between items-start mb-2">
                <Link to={`/projects/${project.slug}`}>
                    <h3 className="text-2xl font-bold group-hover:text-accent transition-colors">{project.title}</h3>
                </Link>
                <div className="flex gap-4 text-xl">
                    {project.github_url && <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-textSecondary hover:text-accent"><FiGithub /></a>}
                    <Link to={`/projects/${project.slug}`} className="text-textSecondary hover:text-accent"><FiArrowUpRight /></Link>
                </div>
            </div>

            <p className="text-textSecondary text-sm mb-6 line-clamp-2">
                {project.description}
            </p>

            <div className="flex flex-wrap gap-2">
                {project.technologies?.map((tech) => (
                    <span key={tech.id} className="text-[11px] font-bold text-accent bg-accent/10 px-3 py-1 rounded-full uppercase">
                        {tech.name}
                    </span>
                ))}
            </div>
        </motion.div>
    );
};

export default ProjectCard;

