import React, { useState, useEffect } from 'react';
import { FaGithub, FaLinkedin, FaDribbble, FaTwitter } from 'react-icons/fa';
import { getProfile } from '../services/api';

const Footer = () => {
    const [profile, setProfile] = useState(null);

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

    return (
        <footer className="bg-secondary py-12 border-t border-border">
            <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-textSecondary text-sm">
                    &copy; {new Date().getFullYear()} Creative Portfolio. All rights reserved.
                </div>

                <div className="flex items-center gap-6">
                    <a href={profile?.github_url || '#'} target="_blank" rel="noopener noreferrer" className="text-textSecondary hover:text-accent transition-colors text-2xl"><FaGithub /></a>
                    <a href={profile?.linkedin_url || '#'} target="_blank" rel="noopener noreferrer" className="text-textSecondary hover:text-accent transition-colors text-2xl"><FaLinkedin /></a>
                    <a href={profile?.dribbble_url || '#'} target="_blank" rel="noopener noreferrer" className="text-textSecondary hover:text-accent transition-colors text-2xl"><FaDribbble /></a>
                    <a href={profile?.portfolio_url || '#'} target="_blank" rel="noopener noreferrer" className="text-textSecondary hover:text-accent transition-colors text-2xl"><FaTwitter /></a>
                </div>

                <div className="text-textSecondary text-sm uppercase tracking-widest font-bold">
                    Made with <span className="text-accent">❤</span> using React & Django
                </div>
            </div>
        </footer>
    );
};

export default Footer;
