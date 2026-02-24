import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, HelpCircle } from 'lucide-react';

const PrizeCard = ({ rank, title, subtitle, icon, color, effectClass, description }) => {
    const borderColors = {
        gold: 'border-[#ffd700] shadow-[0_0_25px_rgba(255,215,0,0.1)] hover:shadow-[0_0_40px_rgba(255,215,0,0.2)]',
        silver: 'border-[#e5e7eb] shadow-[0_0_25px_rgba(255,255,255,0.05)] hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]',
        bronze: 'border-[#cd7f32] shadow-[0_0_25px_rgba(205,127,50,0.1)] hover:shadow-[0_0_40px_rgba(205,127,50,0.2)]',
    };

    const rankLabels = {
        1: '1 МІСЦЕ',
        2: '2 МІСЦЕ',
        3: '3 МІСЦЕ',
    };

    const metalText = {
        gold: 'text-[#ffd700]',
        silver: 'text-white',
        bronze: 'text-[#cd7f32]',
    };

    return (
        <motion.div
            whileHover={{ y: -15, scale: 1.02 }}
            className={`relative group overflow-hidden bg-black p-8 rounded-[2.5rem] border-2 ${borderColors[color] || 'border-white/10'} transition-all duration-700 h-[320px] flex flex-col items-center justify-center cursor-help`}
        >
            {/* Rank Label - Always slightly visible */}
            <div className="absolute top-6 right-6 text-[10px] font-black opacity-20 italic tracking-widest group-hover:opacity-50 transition-opacity">
                {rankLabels[rank]}
            </div>

            {/* Mystery Overlay (Hidden on hover) */}
            <motion.div
                className="absolute inset-0 z-20 bg-black flex items-center justify-center group-hover:opacity-0 transition-opacity duration-500 pointer-events-none"
            >
                <span className={`text-4xl font-black italic opacity-40 ${metalText[color]}`}>?</span>
            </motion.div>

            {/* Prize Content (Visible on hover) */}
            <div className="flex flex-col items-center justify-center w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                <div className={`flex flex-col items-center justify-center h-40 mb-4 relative w-full rounded-2xl overflow-hidden ${effectClass}`}>
                    {icon}
                    {rank === 2 && <div className="smoke-effect"></div>}
                </div>

                <div className="text-center relative z-10 w-full">
                    <h3 className={`text-2xl font-black mb-1 italic tracking-tighter ${metalText[color]}`}>
                        {title}
                    </h3>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mb-2">
                        {subtitle}
                    </p>

                    {rank === 3 && (
                        <div className="py-1 px-3 bg-yellow-500/10 rounded-full border border-yellow-500/20 inline-block">
                            <p className="text-[9px] text-yellow-500 font-bold uppercase">
                                {description}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const PrizePool = () => {
    return (
        <section className="mt-16 w-full px-4">
            <div className="flex items-center justify-center gap-6 mb-12">
                <div className="h-[2px] w-16 bg-gradient-to-r from-transparent to-casino-neon/40" />
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-6xl font-black italic text-center uppercase tracking-tighter"
                >
                    <span className="text-casino-neon neon-text">ПРИЗОВИЙ</span> ФОНД
                </motion.h2>
                <div className="h-[2px] w-16 bg-gradient-to-l from-transparent to-casino-neon/40" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
                {/* 1st Place - Gold */}
                <PrizeCard
                    rank={1}
                    color="gold"
                    title="Інтелектуальний заряд"
                    subtitle="Набір книжок"
                    effectClass="bg-white/5"
                    icon={<BookOpen className="w-20 h-20 text-[#ffd700] drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]" />}
                />

                {/* 2nd Place - Silver */}
                <PrizeCard
                    rank={2}
                    color="silver"
                    title="Димний релакс"
                    subtitle="Табак для кальяну"
                    effectClass="bg-white/5"
                    icon={<div className="text-6xl filter drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">🌫️</div>}
                />

                {/* 3rd Place - Bronze */}
                <PrizeCard
                    rank={3}
                    color="bronze"
                    title="Секретний Лимон"
                    subtitle="Знак питання"
                    description="Відкриється при 50% збору"
                    effectClass="bg-white/5"
                    icon={
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <HelpCircle className="w-20 h-20 text-[#ffd700] drop-shadow-[0_0_25px_rgba(255,215,0,0.9)]" />
                        </motion.div>
                    }
                />
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-16 p-6 glass rounded-2xl border border-white/5 max-w-3xl mx-auto bg-black/40"
            >
                <p className="text-center text-gray-500 font-bold uppercase text-[10px] md:text-xs tracking-[0.3em] leading-relaxed">
                    🏆 Розіграш відбудеться серед ТОП-3 лідерборду на момент закриття банки 🏆
                </p>
            </motion.div>
        </section>
    );
};

export default PrizePool;
