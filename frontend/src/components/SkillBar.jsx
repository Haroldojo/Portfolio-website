import React from 'react';
import { motion } from 'framer-motion';

const SkillBar = ({ name, proficiency }) => {
    return (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
                <span className="font-bold uppercase tracking-widest text-sm">{name}</span>
                <span className="text-accent font-black">{proficiency}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${proficiency}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-accent"
                />
            </div>
        </div>
    );
};

export default SkillBar;
