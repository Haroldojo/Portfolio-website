import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HiSparkles, HiMagnifyingGlass, HiXMark } from 'react-icons/hi2';
import { aiSearch } from '../services/api';

const AISearchBar = () => {
    const [query, setQuery] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const inputRef = useRef(null);
    const barRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (barRef.current && !barRef.current.contains(e.target)) {
                setIsFocused(false);
                if (!loading && !answer && !error) {
                    setShowResults(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [loading, answer, error]);

    // Escape to close
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                setShowResults(false);
                setIsFocused(false);
                setAnswer('');
                setError('');
                inputRef.current?.blur();
            }
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, []);

    // "/" shortcut
    useEffect(() => {
        const handleSlash = (e) => {
            if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        document.addEventListener('keydown', handleSlash);
        return () => document.removeEventListener('keydown', handleSlash);
    }, []);

    const handleSearch = async (e) => {
        e?.preventDefault();
        if (!query.trim() || loading) return;

        setLoading(true);
        setError('');
        setAnswer('');
        setShowResults(true);

        try {
            const res = await aiSearch(query.trim());
            setAnswer(res.data.answer || 'No answer received.');
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseResults = () => {
        setShowResults(false);
        setAnswer('');
        setError('');
    };

    const suggestions = [
        "What projects have you built?",
        "What are your main skills?",
        "Tell me about your experience",
    ];

    return (
        <>
            <style>{`
                @property --bar-angle {
                    syntax: '<angle>';
                    initial-value: 0deg;
                    inherits: false;
                }

                @keyframes spinBorder {
                    to { --bar-angle: 360deg; }
                }

                .search-border {
                    --bar-angle: 0deg;
                    animation: spinBorder 6s linear infinite;
                    background: conic-gradient(
                        from var(--bar-angle),
                        #f7df1e 0%,
                        #2a2a2a 25%,
                        #f7df1e 50%,
                        #2a2a2a 75%,
                        #f7df1e 100%
                    );
                    border-radius: 9999px;
                    padding: 1.5px;
                }

                .search-border.active {
                    animation: spinBorder 1.5s linear infinite;
                    box-shadow: 0 0 20px rgba(247, 223, 30, 0.15), 0 0 40px rgba(247, 223, 30, 0.05);
                }

                .ai-scroll::-webkit-scrollbar { width: 3px; }
                .ai-scroll::-webkit-scrollbar-track { background: transparent; }
                .ai-scroll::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 10px; }
            `}</style>

            <div
                ref={barRef}
                className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[90] flex flex-col items-center"
                style={{ width: 'min(560px, calc(100vw - 40px))' }}
            >
                {/* === Results Panel === */}
                <AnimatePresence>
                    {showResults && (answer || loading || error) && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.25 }}
                            className="w-full mb-2 rounded-xl border border-border overflow-hidden"
                            style={{ background: '#111111' }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                                <div className="flex items-center gap-2">
                                    <HiSparkles className="text-accent text-xs" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent/70">AI Answer</span>
                                </div>
                                <button onClick={handleCloseResults} className="text-textSecondary hover:text-accent transition-colors">
                                    <HiXMark className="text-sm" />
                                </button>
                            </div>

                            {/* Loading */}
                            {loading && (
                                <div className="px-4 py-4 space-y-2.5">
                                    <div className="h-2.5 bg-secondary rounded-full w-4/5 animate-pulse" />
                                    <div className="h-2.5 bg-secondary rounded-full w-3/5 animate-pulse" style={{ animationDelay: '150ms' }} />
                                    <div className="h-2.5 bg-secondary rounded-full w-2/3 animate-pulse" style={{ animationDelay: '300ms' }} />
                                </div>
                            )}

                            {/* Answer */}
                            {answer && !loading && (
                                <div className="px-4 py-3 ai-scroll max-h-[35vh] overflow-y-auto">
                                    <div
                                        className="text-[13px] text-textSecondary leading-relaxed"
                                        dangerouslySetInnerHTML={{
                                            __html: answer
                                                .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#f7df1e">$1</strong>')
                                                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                                .replace(/\n- /g, '<br/>• ')
                                                .replace(/\n\d+\. /g, (m) => `<br/>${m.trim()} `)
                                                .replace(/\n/g, '<br/>')
                                        }}
                                    />
                                </div>
                            )}

                            {/* Error */}
                            {error && !loading && (
                                <div className="px-4 py-3">
                                    <p className="text-xs text-red-400">{error}</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* === Search Bar === */}
                <div className={`search-border w-full ${isFocused ? 'active' : ''}`}>
                    <form
                        onSubmit={handleSearch}
                        className="flex items-center gap-2.5 rounded-full px-4 py-2.5"
                        style={{ background: '#0a0a0a' }}
                    >
                        <HiSparkles className="text-accent text-sm flex-shrink-0" />

                        <input
                            ref={inputRef}
                            id="ai-search-input"
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            placeholder="What do you need help finding?"
                            className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-textSecondary/60 font-medium"
                            maxLength={500}
                            disabled={loading}
                        />

                        {/* Suggestion chips inline (only on focus, no query, no results) */}
                        {isFocused && !query && !showResults && (
                            <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
                                {suggestions.slice(0, 2).map((s, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => { setQuery(s); inputRef.current?.focus(); }}
                                        className="text-[10px] px-2 py-1 rounded-full border border-border text-textSecondary hover:text-accent hover:border-accent/40 transition-all whitespace-nowrap"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={!query.trim() || loading}
                            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all disabled:opacity-20"
                            style={{
                                background: query.trim() ? 'rgba(247,223,30,0.12)' : 'transparent',
                            }}
                        >
                            <HiMagnifyingGlass className={`text-sm ${query.trim() ? 'text-accent' : 'text-textSecondary/40'}`} />
                        </button>
                    </form>
                </div>

                {/* Powered by line */}
                <div className="mt-1.5 flex items-center justify-center gap-1">
                    <span className="text-[9px] text-textSecondary/25 tracking-wide">Powered by AI</span>
                    <span className="text-[9px] text-textSecondary/15">·</span>
                    <span className="text-[9px] text-textSecondary/25 tracking-wide">Press / to search</span>
                </div>
            </div>
        </>
    );
};

export default AISearchBar;
