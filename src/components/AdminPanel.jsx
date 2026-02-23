import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { ShieldCheck, Plus, Search, Terminal } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdminPanel() {
    const [targetNick, setTargetNick] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const addSpins = async (amount) => {
        if (!targetNick) return
        setLoading(true)
        setMessage('')

        try {
            // Find current user's spins
            const { data: user, error: findError } = await supabase
                .from('profiles')
                .select('spins')
                .eq('nickname', targetNick)
                .single()

            if (findError) throw new Error('Гравець не знайдений')

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ spins: (user.spins || 0) + amount })
                .eq('nickname', targetNick)

            if (updateError) throw updateError

            setMessage(`Нараховано +${amount} спінів для ${targetNick}`)
            setTimeout(() => setMessage(''), 3000)
        } catch (err) {
            setMessage(`Помилка: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full glass p-6 rounded-3xl border border-red-500/20 bg-red-500/5">
            <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                        <ShieldCheck className="text-red-500 w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-black text-sm italic uppercase tracking-wider">Адмін-панель</h4>
                        <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Введіть нік для нарахування</p>
                    </div>
                </div>

                <div className="flex flex-grow max-w-md items-center gap-2">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            value={targetNick}
                            onChange={(e) => setTargetNick(e.target.value)}
                            placeholder="Нікнейм..."
                            className="w-full bg-black/40 border border-white/10 p-3 pl-10 rounded-xl outline-none focus:border-red-500 text-sm font-bold transition-all"
                        />
                        <Search className="absolute left-3 top-3 text-gray-500 w-4 h-4" />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => addSpins(5)}
                            disabled={loading || !targetNick}
                            className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl hover:bg-red-500 hover:text-black transition-all font-black text-xs flex items-center gap-1 disabled:opacity-20"
                        >
                            <Plus size={14} /> 5
                        </button>
                        <button
                            onClick={() => addSpins(10)}
                            disabled={loading || !targetNick}
                            className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl hover:bg-red-500 hover:text-black transition-all font-black text-xs flex items-center gap-1 disabled:opacity-20"
                        >
                            <Plus size={14} /> 10
                        </button>
                    </div>
                </div>

                {message && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`text-xs font-bold px-4 py-2 rounded-lg ${message.startsWith('Помилка') ? 'text-red-400 bg-red-400/10' : 'text-green-400 bg-green-400/10'}`}
                    >
                        {message}
                    </motion.div>
                )}
            </div>
        </div>
    )
}
