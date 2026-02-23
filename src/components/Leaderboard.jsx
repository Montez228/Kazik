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
            .limit(5)

        if (data) setLeaders(data)
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-8 rounded-[2rem] border border-white/5 bg-neutral-900/40 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Trophy size={80} className="text-yellow-400" />
            </div>

            <h3 className="text-2xl font-black mb-8 flex items-center gap-3 italic text-casino-neon uppercase tracking-tighter">
                <Crown className="text-yellow-400" /> TOP-5 High Rollers
            </h3>

            <div className="space-y-4 relative z-10">
                <AnimatePresence mode="popLayout">
                    {leaders.map((leader, i) => (
                        <motion.div
                            key={leader.nickname}
                            layout
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className={`flex justify-between items-center p-4 rounded-2xl transition-all border
                ${i === 0 ? 'bg-yellow-400/20 border-yellow-400/40 shadow-[0_0_20px_rgba(251,191,36,0.1)]' :
                                    i === 1 ? 'bg-gray-400/10 border-gray-400/20' :
                                        i === 2 ? 'bg-orange-800/10 border-orange-800/20' : 'bg-white/5 border-white/5'}
              `}
                        >
                            <div className="flex items-center gap-4">
                                <span className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-lg
                  ${i === 0 ? 'bg-yellow-400 text-black' :
                                        i === 1 ? 'bg-gray-300 text-black' :
                                            i === 2 ? 'bg-orange-600 text-black' : 'bg-neutral-800 text-white'}
                `}>
                                    {i + 1}
                                </span>
                                <span className="font-bold text-lg tracking-tight">{leader.nickname}</span>
                            </div>
                            <div className="text-right">
                                <span className={`font-black text-xl ${i === 0 ? 'text-yellow-400' : 'text-casino-cyan'}`}>
                                    {leader.points.toLocaleString()}
                                </span>
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-0.5">PTS</p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {leaders.length === 0 && (
                    <div className="py-12 text-center">
                        <div className="animate-pulse text-gray-600 font-bold italic">WAITING FOR CHAMPIONS...</div>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
