import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiMapPin, FiSend, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { FaGithub, FaLinkedin, FaDribbble } from 'react-icons/fa';
import { submitContact, getProfile } from '../services/api';

const Contact = () => {
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        project_type: 'web_development',
        message: ''
    });
    const [status, setStatus] = useState({ type: null, message: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getProfile();
                setProfile(res.data);
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };
        fetchProfile();
    }, []);

    const projectTypes = [
        { id: 'web_development', label: 'Web Development' },
        { id: 'ui_ux_design', label: 'UI/UX Design' },
        { id: 'branding', label: 'Branding' },
        { id: 'consultation', label: 'Consultation' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: null, message: '' });

        try {
            const res = await submitContact(formData);
            setStatus({ type: 'success', message: res.data.message });
            setFormData({ name: '', email: '', project_type: 'web_development', message: '' });
        } catch (error) {
            console.error("Error submitting contact form:", error);
            setStatus({
                type: 'error',
                message: 'Something went wrong. Please try again later.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="pt-40 pb-32">
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="mb-20 text-center">
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4"
                    >
                        LET'S <span className="text-accent">WORK</span> TOGETHER
                    </motion.h2>
                    <p className="text-textSecondary text-xl max-w-2xl mx-auto">
                        Currently available for freelance projects and full-time remote opportunities. Have an idea? Let's bring it to life!
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-16 items-start">
                    {/* Left Column - Contact Info */}
                    <div className="lg:w-2/5 space-y-12">
                        <div className="space-y-8">
                            <div className="bg-card p-10 border border-border rounded-3xl group hover:border-accent transition-all">
                                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent text-3xl mb-6 group-hover:scale-110 transition-transform">
                                    <FiMail />
                                </div>
                                <p className="text-xs font-bold text-textSecondary uppercase tracking-widest mb-2">EMAIL ME</p>
                                <h3 className="text-2xl font-black transition-colors group-hover:text-accent">{profile?.email || 'hello@portfolio.design'}</h3>
                            </div>

                            <div className="bg-card p-10 border border-border rounded-3xl group hover:border-accent transition-all">
                                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent text-3xl mb-6 group-hover:scale-110 transition-transform">
                                    <FiMapPin />
                                </div>
                                <p className="text-xs font-bold text-textSecondary uppercase tracking-widest mb-2">LOCATION</p>
                                <h3 className="text-2xl font-black transition-colors group-hover:text-accent">{profile?.location || 'Brooklyn, New York'}</h3>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 pt-6">
                            <span className="text-textSecondary font-bold text-sm tracking-widest uppercase">SOCIALS</span>
                            <div className="h-[1px] w-20 bg-border"></div>
                            <div className="flex gap-4">
                                <a href={profile?.linkedin_url || '#'} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-2xl text-textSecondary hover:bg-accent hover:text-background transition-all"><FaLinkedin /></a>
                                <a href={profile?.github_url || '#'} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-2xl text-textSecondary hover:bg-accent hover:text-background transition-all"><FaGithub /></a>
                                <a href={profile?.dribbble_url || '#'} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-2xl text-textSecondary hover:bg-accent hover:text-background transition-all"><FaDribbble /></a>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Form */}
                    <div className="lg:w-3/5 bg-card p-8 md:p-12 border border-border rounded-[3rem] shadow-2xl relative overflow-hidden">
                        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-textSecondary uppercase tracking-widest">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-secondary border border-border rounded-xl px-6 py-4 focus:outline-none focus:border-accent transition-colors"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-textSecondary uppercase tracking-widest">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-secondary border border-border rounded-xl px-6 py-4 focus:outline-none focus:border-accent transition-colors"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-textSecondary uppercase tracking-widest">Project Type</label>
                                <select
                                    name="project_type"
                                    value={formData.project_type}
                                    onChange={handleChange}
                                    className="w-full bg-secondary border border-border rounded-xl px-6 py-4 focus:outline-none focus:border-accent transition-colors appearance-none"
                                >
                                    {projectTypes.map(type => (
                                        <option key={type.id} value={type.id}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-textSecondary uppercase tracking-widest">Your Message</label>
                                <textarea
                                    name="message"
                                    required
                                    rows="6"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full bg-secondary border border-border rounded-xl px-6 py-4 focus:outline-none focus:border-accent transition-colors resize-none"
                                    placeholder="Tell me about your project..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-5 text-xl flex items-center justify-center gap-3 shadow-[0_10px_40px_rgba(247,223,30,0.3)] disabled:opacity-50"
                            >
                                {loading ? 'SENDING...' : (
                                    <>SEND MESSAGE <FiSend /></>
                                )}
                            </button>

                            {status.type === 'error' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-500/10 text-red-500 p-6 rounded-2xl flex items-center gap-4 border border-red-500/20"
                                >
                                    <FiAlertCircle className="text-2xl shrink-0" />
                                    <p className="font-bold">{status.message}</p>
                                </motion.div>
                            )}

                            {status.type === 'success' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-green-500/10 text-green-500 p-6 rounded-2xl flex items-center gap-4 border border-green-500/20"
                                >
                                    <FiCheckCircle className="text-2xl shrink-0" />
                                    <p className="font-bold">{status.message}</p>
                                </motion.div>
                            )}
                        </form>

                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent opacity-5 rounded-full translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 border border-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
