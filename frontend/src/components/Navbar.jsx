import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Projects', path: '/projects' },
        { name: 'About', path: '/about' },
        { name: 'Resume', path: '/resume' },
        { name: 'Contact', path: '/contact' },
    ];

    const activeStyle = "text-accent font-bold border-b-2 border-accent";
    const inactiveStyle = "text-textPrimary hover:text-accent transition-colors font-medium";

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-md py-4' : 'bg-transparent py-6'}`}>
            <div className="container mx-auto px-6 flex justify-between items-center">
                <Link to="/" className="text-2xl font-black tracking-tighter flex items-center gap-2">
                    <div className="w-8 h-8 bg-accent rounded-sm flex items-center justify-center text-background text-xl italic">P</div>
                    PORTFOLIO
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            className={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}
                        >
                            {link.name}
                        </NavLink>
                    ))}
                    <Link to="/contact" className="btn-primary py-2 px-6 text-sm">HIRE ME</Link>
                </div>

                {/* Mobile Toggle */}
                <button className="md:hidden text-3xl text-accent" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <HiX /> : <HiMenuAlt3 />}
                </button>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                        className="fixed inset-0 bg-background z-40 flex flex-col items-center justify-center gap-8 text-2xl"
                    >
                        <button className="absolute top-6 right-6 text-4xl text-accent" onClick={() => setIsOpen(false)}>
                            <HiX />
                        </button>
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                className={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}
                                onClick={() => setIsOpen(false)}
                            >
                                {link.name}
                            </NavLink>
                        ))}
                        <Link to="/contact" className="btn-primary" onClick={() => setIsOpen(false)}>HIRE ME</Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;

