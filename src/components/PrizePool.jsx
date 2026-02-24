import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, HelpCircle, Wind } from 'lucide-react';

const PrizeCard = ({ rank, title, subtitle, icon, color, description }) => {
    const borderColors = {
        gold: 'border-[#ffd700] shadow-[0_0_15px_rgba(255,215,0,0.3)]',
        silver: 'border-[#e5e7eb] shadow-[0_0_15px_rgba(255,255,255,0.2)]',
        bronze: 'border-[#cd7f32] shadow-[0_0_15px_rgba(205,127,50,0.3)]',
    };

    const textColors = {
        gold: 'text-[#ffd700]',
        silver: 'text-white',
        bronze: 'text-[#cd7f32]',
    };

    const rankLabels = {
        1: '1 МІСЦЕ',
        2: '2 МІСЦЕ',
        3: '3 МІСЦЕ',
    };

    return (
        <motion.div
            whileHover={{ y: -10 }}
            className={`relative flex flex-col items-center justify-center p-8 rounded-[2rem] border-4 bg-black/80 ${borderColors[color]} transition-all duration-300 min-h-[300px] z-30`}
        >
            <div className={`absolute top-4 right-6 text-sm font-black italic opacity-60 ${textColors[color]}`}>
                {rankLabels[rank]}
            </div>

            <div className="mb-6 flex items-center justify-center">
                {icon}
            </div>

            <div className="text-center w-full">
                <h3 className={`text-2xl md:text-3xl font-black mb-2 italic uppercase tracking-tighter ${textColors[color]}`}>
                    {title}
                </h3>
                <p className="text-gray-300 text-sm font-bold uppercase tracking-widest mb-4">
                    {subtitle}
                </p>

                {description && (
                    <div className="mt-2 py-2 px-4 bg-white/10 rounded-xl border border-white/20">
                        <p className="text-[11px] text-yellow-500 font-black uppercase tracking-tight">
                            {description}
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const PrizePool = () => {
    return (
        <section id="prizes" className="w-full py-10 relative z-20">
            <div className="flex items-center justify-center gap-4 mb-12">
                <div className="h-1 flex-1 bg-gradient-to-r from-transparent to-yellow-500" />
                <h2 className="text-4xl md:text-6xl font-black italic text-center uppercase tracking-tighter text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                    ПРИЗОВИЙ ФОНД
                </h2>
                <div className="h-1 flex-1 bg-gradient-to-l from-transparent to-yellow-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto px-2">
                {/* 1st Place - Gold */}
                <PrizeCard
                    rank={1}
                    color="gold"
                    title="Книги"
                    subtitle="Інтелектуальний заряд"
                    icon={<BookOpen className="w-20 h-20 text-[#ffd700] drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]" />}
                />

                {/* 2nd Place - Silver */}
                <PrizeCard
                    rank={2}
                    color="silver"
                    title="Табак"
                    subtitle="Димний релакс"
                    icon={<Wind className="w-20 h-20 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]" />}
                />

                {/* 3rd Place - Bronze */}
                <PrizeCard
                    rank={3}
                    color="bronze"
                    title="Секрет"
                    subtitle="Секретний Лимон"
                    description="Відкриється при 50% збору"
                    icon={
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                            <HelpCircle className="w-20 h-20 text-[#cd7f32] drop-shadow-[0_0_15px_rgba(205,127,50,0.8)]" />
                        </motion.div>
                    }
                />
            </div>

            <div className="mt-12 p-6 border-2 border-dashed border-white/20 rounded-2xl bg-black/50 overflow-hidden relative group">
                <p className="text-center text-gray-400 font-black uppercase text-xs md:text-sm tracking-[0.2em] relative z-10">
                    🏆 Розіграш відбудеться серед ТОП-3 лідерборду на момент закриття банки 🏆
                </p>
                <div className="absolute inset-0 bg-yellow-500/5 group-hover:bg-yellow-500/10 transition-colors" />
            </div>
        </section>
    );
};

export default PrizePool;
