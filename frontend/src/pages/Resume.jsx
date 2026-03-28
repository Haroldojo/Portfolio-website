import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiMail, FiMapPin, FiLinkedin, FiExternalLink } from 'react-icons/fi';
import SkillBar from '../components/SkillBar';
import { getProfile, getSkills, getExperience, getEducation } from '../services/api';

const Resume = () => {
    const [data, setData] = useState({
        profile: null,
        skills: [],
        experience: [],
        education: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, skillsRes, expRes, eduRes] = await Promise.all([
                    getProfile(),
                    getSkills(),
                    getExperience(),
                    getEducation()
                ]);
                setData({
                    profile: profileRes.data,
                    skills: skillsRes.data,
                    experience: expRes.data,
                    education: eduRes.data
                });
            } catch (error) {
                console.error("Error fetching resume data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background text-accent">
                <div className="animate-spin text-5xl italic font-black">P</div>
            </div>
        );
    }

    const { profile, skills, experience, education } = data;

    return (
        <div className="pt-40 pb-32">
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="mb-20">
                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">
                        RESUME <span className="text-accent">&</span> EXPERIENCE
                    </h2>
                    <div className="w-20 h-1 bg-accent mb-8"></div>
                    <p className="text-textSecondary text-xl max-w-2xl">
                        A journey of building, learning, and leading in the world of design and technology.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Left Column - Sidebar */}
                    <aside className="lg:w-1/3 space-y-12">
                        <div>
                            <h3 className="text-xl font-bold uppercase tracking-[0.2em] mb-8 border-l-4 border-accent pl-4">ABOUT ME</h3>
                            <p className="text-textSecondary leading-relaxed italic">
                                {profile?.bio}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold uppercase tracking-[0.2em] mb-8 border-l-4 border-accent pl-4">CORE SKILLS</h3>
                            {skills.map((skill) => (
                                <SkillBar key={skill.id} name={skill.name} proficiency={skill.proficiency} />
                            ))}
                        </div>

                        <div className="bg-card p-8 border border-border rounded-2xl">
                            <h3 className="text-xl font-bold uppercase tracking-[0.2em] mb-8">PERSONAL DETAILS</h3>
                            <ul className="space-y-6">
                                <li className="flex items-center gap-4 text-textSecondary">
                                    <FiMail className="text-accent text-xl" />
                                    <span>{profile?.email}</span>
                                </li>
                                <li className="flex items-center gap-4 text-textSecondary">
                                    <FiMapPin className="text-accent text-xl" />
                                    <span>{profile?.location}</span>
                                </li>
                                <li className="flex items-center gap-4 text-textSecondary">
                                    <FiLinkedin className="text-accent text-xl" />
                                    <a href={profile?.linkedin_url} className="hover:text-accent flex items-center gap-1 transition-colors">
                                        LinkedIn <FiExternalLink className="text-xs" />
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </aside>

                    {/* Right Column - Timeline */}
                    <main className="lg:w-2/3 space-y-20">
                        {/* Experience */}
                        <section>
                            <h3 className="text-3xl font-black uppercase tracking-tighter mb-12 flex items-center gap-4">
                                WORK <span className="text-accent">HISTORY</span>
                            </h3>

                            <div className="space-y-12 border-l border-border ml-4 pl-12 relative">
                                {experience.map((exp, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        className="relative"
                                    >
                                        <div className="absolute -left-[61px] top-0 w-4 h-4 rounded-full bg-accent border-4 border-background shadow-[0_0_10px_rgba(247,223,30,0.5)]"></div>
                                        <div className="mb-2 flex items-center justify-between">
                                            <h4 className="text-2xl font-bold text-accent">{exp.role}</h4>
                                            <span className="bg-secondary px-4 py-1 rounded-full text-[10px] font-black tracking-widest text-textPrimary">
                                                {new Date(exp.start_date).getFullYear()} - {exp.is_current ? 'PRESENT' : new Date(exp.end_date).getFullYear()}
                                            </span>
                                        </div>
                                        <p className="text-xl font-bold mb-4 uppercase tracking-tight">{exp.company}</p>
                                        <p className="text-textSecondary mb-6 leading-relaxed">
                                            {exp.description}
                                        </p>
                                        <ul className="grid md:grid-cols-2 gap-4">
                                            {exp.achievements?.map((goal, i) => (
                                                <li key={i} className="flex gap-3 text-sm text-textSecondary">
                                                    <span className="text-accent">→</span> {goal}
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                ))}
                            </div>
                        </section>

                        {/* Education */}
                        <section>
                            <h3 className="text-3xl font-black uppercase tracking-tighter mb-12 flex items-center gap-4">
                                ACADEMIC <span className="text-accent">BACKGROUND</span>
                            </h3>
                            <div className="grid md:grid-cols-2 gap-8">
                                {education.map((edu, idx) => (
                                    <div key={idx} className="bg-card p-8 border border-border rounded-2xl hover:border-accent transition-all">
                                        <span className="text-accent font-black text-sm block mb-2">{edu.start_year} - {edu.end_year}</span>
                                        <h4 className="text-xl font-bold mb-2 uppercase">{edu.degree}</h4>
                                        <p className="text-textSecondary font-bold text-sm uppercase tracking-widest">{edu.institution}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </main>
                </div>

                {/* Resume Download Section */}
                <div className="mt-40 bg-accent p-12 md:p-16 rounded-[3rem] text-background flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative">
                    <div className="flex items-center gap-8 relative z-10">
                        <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/30 overflow-hidden hidden md:block">
                            {profile?.profile_image ? (
                                <img src={profile.profile_image} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-black text-4xl">P</div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-2xl font-black">{profile?.name.toUpperCase()}</h3>
                            <p className="font-bold opacity-75">{profile?.title}</p>
                        </div>
                    </div>

                    <a
                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/resume/download/`}
                        className="btn-primary bg-background text-accent px-12 py-5 text-xl flex items-center gap-4 shadow-2xl relative z-10"
                    >
                        DOWNLOAD FULL RESUME (PDF) <FiDownload />
                    </a>

                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3"></div>
                </div>
            </div>
        </div>
    );
};

export default Resume;
