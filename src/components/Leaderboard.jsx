import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Crown } from 'lucide-react'

export default function Leaderboard() {
    const [leaders, setLeaders] = useState([])

    useEffect(() => {
        fetchLeaders()

        // Real-time subscription to any profile change to update leaderboard
        const subscription = supabase
            .channel('global-leaderboard')
            .on('postgres_changes', { event: '*', table: 'profiles' }, () => {
                fetchLeaders()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(subscription)
        }
    }, [])

    const fetchLeaders = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('nickname, points')
            .order('points', { ascending: false })
            .limit(10)

        if (data) setLeaders(data)
    }

    const getMedal = (index) => {
        if (index === 0) return '🥇'
        if (index === 1) return '🥈'
        if (index === 2) return '🥉'
        return `${index + 1}.`
    }

    const getRowStyle = (index) => {
        if (index === 0) return 'bg-gradient-to-r from-yellow-400/30 to-yellow-600/10 border-yellow-400/50 shadow-[0_0_30px_rgba(251,191,36,0.2)]'
        if (index === 1) return 'bg-gradient-to-r from-gray-400/20 to-gray-500/5 border-gray-400/30'
        if (index === 2) return 'bg-gradient-to-r from-orange-400/20 to-orange-600/5 border-orange-400/30'
        return 'bg-white/5 border-white/5 hover:bg-white/10'
    }

    const getNickStyle = (index) => {
        if (index === 0) return 'text-yellow-400 font-black text-xl text-glow-gold'
        if (index === 1) return 'text-gray-300 font-bold text-lg text-glow-silver'
        if (index === 2) return 'text-orange-400 font-bold text-lg text-glow-bronze'
        return 'text-white font-medium'
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-6 md:p-8 rounded-[2rem] border border-white/5 bg-neutral-900/40 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Trophy size={80} className="text-yellow-400" />
            </div>

            <h3 className="text-2xl font-black mb-8 flex items-center gap-3 italic text-casino-neon uppercase tracking-tighter">
                <Crown className="text-yellow-400 animate-crown" /> ТОП-10 ЛИМОНЕРІВ
            </h3>

            <div className="space-y-3 relative z-10">
                <AnimatePresence mode="popLayout">
                    {leaders.map((leader, i) => (
                        <motion.div
                            key={leader.nickname}
                            layout
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className={`flex justify-between items-center p-4 rounded-2xl transition-all border ${getRowStyle(i)}`}
                        >
                            <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                                <span className={`flex items-center justify-center font-black text-lg min-w-[30px]`}>
                                    {getMedal(i)}
                                </span>
                                <span className={`truncate ${getNickStyle(i)}`}>
                                    {leader.nickname}
                                </span>
                            </div>
                            <div className="text-right shrink-0">
                                <span className={`font-black text-lg md:text-xl ${i === 0 ? 'text-yellow-400' : i < 3 ? 'text-white' : 'text-casino-cyan'}`}>
                                    {leader.points.toLocaleString()}
                                </span>
                                <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest leading-none mt-1">БАЛІВ</p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {leaders.length === 0 && (
                    <div className="py-12 text-center">
                        <div className="animate-pulse text-gray-600 font-bold italic">ОЧІКУЄМО НА ЧЕМПІОНІВ...</div>
                    </div>
                )}
            </div>
        </motion.div>
    )
}

