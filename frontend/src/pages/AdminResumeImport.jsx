import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiCheckCircle, FiAlertCircle, FiFile, FiLoader, FiLock } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const AdminResumeImport = () => {
    const [token, setToken] = useState(import.meta.env.VITE_ADMIN_API_TOKEN || '');
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState({ type: null, message: '' });
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const dropped = e.dataTransfer.files[0];
            if (dropped.type === 'application/pdf') {
                setFile(dropped);
                setStatus({ type: null, message: '' });
            } else {
                setStatus({ type: 'error', message: 'Only PDF files are accepted.' });
            }
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus({ type: null, message: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !token) return;

        setLoading(true);
        setStatus({ type: null, message: '' });

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_URL}/admin/import-resume/`, {
                method: 'POST',
                headers: {
                    'X-Admin-Token': token,
                },
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                setStatus({
                    type: 'success',
                    message: data.detail || 'Resume imported successfully!',
                });
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            } else {
                setStatus({
                    type: 'error',
                    message: data.detail || `Error: ${res.status}`,
                });
            }
        } catch (err) {
            setStatus({
                type: 'error',
                message: 'Network error. Make sure the backend is running.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-40 pb-32 min-h-screen">
            <div className="container mx-auto px-6 max-w-2xl">
                {/* Header */}
                <div className="mb-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-secondary px-4 py-1 rounded-full text-[10px] font-black tracking-widest text-accent mb-6"
                    >
                        <FiLock className="text-xs" />
                        ADMIN ONLY
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4"
                    >
                        RESUME <span className="text-accent">IMPORT</span>
                    </motion.h2>
                    <p className="text-textSecondary text-lg max-w-xl mx-auto">
                        Upload your PDF resume. AI will parse it and automatically populate your portfolio with data from the resume.
                    </p>
                </div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-card p-8 md:p-12 border border-border rounded-[2rem] relative overflow-hidden"
                >
                    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                        {/* Token Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-textSecondary uppercase tracking-widest flex items-center gap-2">
                                <FiLock className="text-accent" /> Admin Token
                            </label>
                            <input
                                type="password"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                className="w-full bg-secondary border border-border rounded-xl px-6 py-4 focus:outline-none focus:border-accent transition-colors font-mono text-sm"
                                placeholder="Enter your admin API token..."
                                required
                            />
                        </div>

                        {/* File Drop Zone */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-textSecondary uppercase tracking-widest flex items-center gap-2">
                                <HiSparkles className="text-accent" /> Resume PDF
                            </label>
                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`
                                    w-full border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300
                                    ${dragActive
                                        ? 'border-accent bg-accent/5 scale-[1.02]'
                                        : file
                                            ? 'border-green-500/50 bg-green-500/5'
                                            : 'border-border hover:border-accent/50 bg-secondary/50'
                                    }
                                `}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                {file ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <FiFile className="text-4xl text-green-500" />
                                        <p className="font-bold text-green-400">{file.name}</p>
                                        <p className="text-textSecondary text-sm">
                                            {(file.size / 1024).toFixed(1)} KB — Click or drop to replace
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-3">
                                        <FiUpload className="text-4xl text-accent" />
                                        <p className="font-bold">Drop your PDF resume here</p>
                                        <p className="text-textSecondary text-sm">or click to browse</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || !file || !token}
                            className="btn-primary w-full py-5 text-lg flex items-center justify-center gap-3 shadow-[0_10px_40px_rgba(247,223,30,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <FiLoader className="animate-spin" />
                                    AI IS PARSING YOUR RESUME...
                                </>
                            ) : (
                                <>
                                    <HiSparkles />
                                    IMPORT RESUME WITH AI
                                </>
                            )}
                        </button>

                        {/* Status Messages */}
                        <AnimatePresence>
                            {status.type === 'success' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-green-500/10 text-green-500 p-6 rounded-2xl flex items-start gap-4 border border-green-500/20"
                                >
                                    <FiCheckCircle className="text-2xl shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold mb-1">{status.message}</p>
                                        <p className="text-sm text-green-400/70">
                                            Your portfolio pages will now show the updated data from your resume.
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {status.type === 'error' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-red-500/10 text-red-500 p-6 rounded-2xl flex items-center gap-4 border border-red-500/20"
                                >
                                    <FiAlertCircle className="text-2xl shrink-0" />
                                    <p className="font-bold">{status.message}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>

                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent opacity-5 rounded-full translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 border border-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                </motion.div>

                {/* Info Card */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 bg-secondary p-8 rounded-2xl border border-border"
                >
                    <h4 className="font-bold uppercase tracking-widest text-sm text-accent mb-4">HOW IT WORKS</h4>
                    <ul className="space-y-3 text-textSecondary text-sm">
                        <li className="flex items-start gap-3">
                            <span className="text-accent font-bold">1.</span>
                            Upload your PDF resume with a valid admin token.
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-accent font-bold">2.</span>
                            AI extracts and structures your profile, experience, education, projects, and skills.
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-accent font-bold">3.</span>
                            The database is updated — all existing data is replaced with your resume data.
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-accent font-bold">4.</span>
                            All portfolio pages automatically reflect the new data.
                        </li>
                    </ul>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminResumeImport;
