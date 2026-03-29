import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaLinkedinIn, FaGithub, FaDribbble } from 'react-icons/fa';
import { FiArrowRight } from 'react-icons/fi';
import { RiLayoutMasonryLine, RiCodeSSlashLine, RiPaletteLine } from 'react-icons/ri';
import StatItem from '../components/StatItem';
import { getProfile, getStats } from '../services/api';

const Home = () => {
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, statsRes] = await Promise.all([
                    getProfile(),
                    getStats()
                ]);
                setProfile(profileRes.data);
                setStats(statsRes.data);
            } catch (error) {
                console.error("Error fetching homepage data:", error);
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
    if (!profile) {
        return <div className="text-center text-accent mt-20">Failed to load profile.</div>;
    }

    const title = profile?.title || "";
    const titleParts = title.split(" & ");
    const expertise = [
        {
            title: "UI/UX Design",
            icon: <RiLayoutMasonryLine className="text-4xl text-accent mb-4" />,
            desc: "Creating visually stunning and highly functional user interfaces with a focus on user experience and accessibility."
        },
        {
            title: "Web Development",
            icon: <RiCodeSSlashLine className="text-4xl text-accent mb-4" />,
            desc: "Building robust, scalable applications using modern stacks like React, Django, and Node.js with pixel-perfect accuracy."
        },
        {
            title: "Brand Identity",
            icon: <RiPaletteLine className="text-4xl text-accent mb-4" />,
            desc: "Crafting unique visual identities and consistent branding across all digital platforms and physical touchpoints."
        }
    ];

    return (
        <div className="pt-20">
            {/* Hero Section */}
            <section className="container mx-auto px-6 py-20 min-h-[80vh] flex flex-col md:flex-row items-center gap-12">
                <div className="md:w-3/5">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 bg-secondary px-4 py-1 rounded-full text-[10px] font-black tracking-widest text-accent mb-8"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                        </span>
                        AVAILABLE FOR WORK
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-8"
                    >
                        {titleParts.map((part, i) => (
                            <React.Fragment key={i}>
                                {i === 1 && <span className="text-accent">&</span>}
                                <span className={i === 1 ? 'text-accent ml-2' : ''}>{part}</span>
                                <br />
                            </React.Fragment>
                        ))}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-textSecondary text-lg md:text-xl max-w-2xl mb-12"
                    >
                        {profile?.bio}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-wrap gap-6 items-center mb-12"
                    >
                        <Link to="/contact" className="btn-primary flex items-center gap-2">
                            HIRE ME <FiArrowRight />
                        </Link>
                        <Link to="/projects" className="btn-outline">
                            VIEW PROJECTS
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center gap-8"
                    >
                        <div className="flex gap-4">
                            <a href={profile?.linkedin_url} className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-textSecondary hover:text-accent hover:border-accent transition-all"><FaLinkedinIn /></a>
                            <a href={profile?.github_url} className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-textSecondary hover:text-accent hover:border-accent transition-all"><FaGithub /></a>
                            <a href={profile?.dribbble_url} className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-textSecondary hover:text-accent hover:border-accent transition-all"><FaDribbble /></a>
                        </div>
                        <div className="h-12 w-[1px] bg-border"></div>
                        <div className="flex flex-col">
                            <span className="text-accent font-black text-2xl leading-none">{profile?.years_experience}+ YEARS</span>
                            <span className="text-textSecondary text-[10px] font-bold uppercase tracking-widest">EXPERIENCE</span>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="md:w-2/5 relative"
                >
                    <div className="aspect-[4/5] bg-card border-x border-t border-border rounded-t-[100px] overflow-hidden relative z-10">
                        {profile?.profile_image ? (
                            <img src={profile.profile_image} alt={profile.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-accent text-opacity-10 text-9xl italic font-black">
                                DEV
                            </div>
                        )}
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent rounded-full -z-0 blur-3xl opacity-20 animate-pulse"></div>
                    <div className="absolute -top-10 -left-10 w-32 h-32 border-2 border-accent border-dashed rounded-full -z-0 opacity-20 rotate-12"></div>
                </motion.div>
            </section>

            {/* Core Expertise */}
            <section className="bg-secondary py-32">
                <div className="container mx-auto px-6">
                    <div className="mb-20">
                        <h2 className="section-title">CORE <span className="text-accent">EXPERTISE</span></h2>
                        <div className="w-20 h-1 bg-accent"></div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {expertise.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-background p-10 rounded-2xl border border-border hover:border-accent transition-all duration-300 group"
                            >
                                {item.icon}
                                <h3 className="text-2xl font-bold mb-4 uppercase tracking-tighter group-hover:text-accent transition-colors">{item.title}</h3>
                                <p className="text-textSecondary leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 border-y border-border">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x md:divide-x-0">
                        {stats.map((stat) => (
                            <StatItem key={stat.id} value={stat.value} label={stat.label} />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-6 py-32">
                <div className="bg-accent rounded-[3rem] p-12 md:p-24 relative overflow-hidden text-background">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="max-w-2xl text-center md:text-left">
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-6">
                                Interested in <span className="text-white">working</span> together? <br /> Let's build something <span className="text-white italic">amazing</span>.
                            </h2>
                        </div>
                        <Link to="/contact" className="bg-background text-accent font-black py-6 px-12 rounded-full text-xl hover:scale-110 transition-transform shadow-2xl">
                            CONTACT ME NOW
                        </Link>
                    </div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 border-[40px] border-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                </div>
            </section>
        </div>
    );
};

export default Home;
