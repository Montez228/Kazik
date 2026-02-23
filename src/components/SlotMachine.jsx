import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import confetti from 'canvas-confetti'

const SYMBOLS = ['🍒', '🍋', '777', '🛸', '🏦']
const REWARDS = {
    '🍒': 10,
    '🍋': 20,
    '🏦': 50,
    '🛸': 100,
    '777': 500
}

export default function SlotMachine({ user, isMuted }) {
    const [spinning, setSpinning] = useState(false)
    const [results, setResults] = useState(['777', '777', '777'])
    const [win, setWin] = useState(null)
    const [spinText, setSpinText] = useState('КРУТИМО... 🍋')


    const spinAudio = useRef(new Audio('https://assets.mixkit.co/music/preview/mixkit-casino-night-633.mp3'))
    const clickAudio = useRef(new Audio('https://www.soundjay.com/buttons/sounds/button-20.mp3'))
    const winAudio = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2012/2012-preview.mp3'))

    useEffect(() => {
        const spin = spinAudio.current
        spin.loop = true
        return () => {
            spin.pause()
            spin.currentTime = 0
        }
    }, [])

    const spin = async () => {
        if (spinning || user.spins <= 0) return

        const texts = ['КРУТИМО... 🍋', 'ЗАЦІНИ ЛИМОН...']
        setSpinText(texts[Math.floor(Math.random() * texts.length)])
        setSpinning(true)
        setWin(null)


        // Deduct spin first
        const { error: spinError } = await supabase
            .from('profiles')
            .update({ spins: user.spins - 1 })
            .eq('id', user.id)

        if (spinError) {
            console.error(spinError)
            setSpinning(false)
            return
        }

        // 2. Local Animation Logic
        if (!isMuted) {
            spinAudio.current.currentTime = 0
            spinAudio.current.play().catch(() => { })
        }

        const newResults = [
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
        ]

        // Simulate staggered reel stopping
        setTimeout(() => {
            setResults(prev => [newResults[0], prev[1], prev[2]])
            if (!isMuted) clickAudio.current.cloneNode().play()

            setTimeout(() => {
                setResults(prev => [prev[0], newResults[1], prev[2]])
                if (!isMuted) clickAudio.current.cloneNode().play()

                setTimeout(async () => {
                    setResults(prev => [prev[0], prev[1], newResults[2]])
                    if (!isMuted) clickAudio.current.cloneNode().play()

                    setSpinning(false)
                    spinAudio.current.pause()

                    // 3. Check for matching symbols
                    if (newResults[0] === newResults[1] && newResults[1] === newResults[2]) {
                        const reward = REWARDS[newResults[0]]
                        setWin(reward)

                        if (!isMuted) winAudio.current.play().catch(() => { })
                        confetti({
                            particleCount: 150,
                            spread: 70,
                            origin: { y: 0.6 },
                            colors: ['#f0abfc', '#22d3ee', '#fbbf24']
                        })

                        // Update points - better to use RLS or fetch latest, but we'll use the user object
                        // which is kept in sync via realtime in App.jsx
                        const { error: pointsError } = await supabase
                            .from('profiles')
                            .update({ points: user.points + reward })
                            .eq('id', user.id)

                        if (pointsError) console.error('Error updating points:', pointsError)
                    }
                }, 600)
            }, 600)
        }, 1200)
    }

    return (
        <div className="flex flex-col items-center">
            <div className="glass p-8 md:p-12 rounded-[4rem] neon-border bg-black/60 relative overflow-hidden backdrop-blur-xl">
                {/* Visual Glows */}
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-casino-neon/20 blur-[80px] rounded-full" />
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-casino-cyan/20 blur-[80px] rounded-full" />

                <div className="flex gap-4 md:gap-8 mb-12 relative z-10">
                    {results.map((symbol, i) => (
                        <div key={i} className="w-24 h-36 md:w-36 md:h-56 bg-neutral-950 rounded-3xl flex items-center justify-center border border-white/10 relative shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] overflow-hidden">
                            <motion.div
                                key={symbol + (spinning ? '-spinning' : '-static') + i}
                                initial={spinning ? { y: -200, opacity: 0 } : { y: 0, opacity: 1 }}
                                animate={spinning ? { y: [0, 200, -200, 0] } : { y: 0, opacity: 1 }}
                                transition={spinning ? { repeat: Infinity, duration: 0.15, ease: 'linear' } : { type: 'spring', damping: 12, stiffness: 100 }}
                                className="text-5xl md:text-7xl select-none filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                            >
                                {symbol}
                            </motion.div>
                            {/* Overlay for depth */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none" />
                            <div className="absolute inset-0 border-x border-white/5 pointer-events-none" />
                        </div>
                    ))}
                </div>

                <motion.button
                    whileHover={!spinning && user.spins > 0 ? { scale: 1.02, boxShadow: '0 0 40px rgba(240,171,252,0.6)' } : {}}
                    whileTap={!spinning && user.spins > 0 ? { scale: 0.95 } : {}}
                    onClick={spin}
                    disabled={spinning || user.spins <= 0}
                    className={`w-full py-8 rounded-[2rem] font-black text-3xl transition-all relative overflow-hidden
            ${spinning ? 'bg-neutral-800/80 text-neutral-500 cursor-wait opacity-75 grayscale-[0.5]' : 'bg-casino-neon text-black'}
            ${user.spins <= 0 && !spinning ? 'bg-red-500/20 text-red-500 border border-red-500/50 grayscale' : 'shadow-[0_0_20px_rgba(240,171,252,0.4)]'}
          `}
                >
                    <span className={`relative z-10 italic uppercase tracking-widest leading-none ${spinning ? 'animate-text-pulse' : ''}`}>
                        {spinning ? spinText : user.spins <= 0 ? 'Без спінів' : 'КРУТИТИ ЛИМОН'}
                    </span>

                    {!spinning && user.spins > 0 && (
                        <motion.div
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/2 -skew-x-12 opacity-30"
                        />
                    )}
                </motion.button>
            </div>

            <AnimatePresence>
                {win && (
                    <motion.div
                        initial={{ scale: 0, y: 50, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="mt-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-12 py-5 rounded-full font-black text-4xl shadow-[0_0_50px_rgba(251,191,36,0.6)] border-4 border-white/20"
                    >
                        +{win} БАЛІВ! 🎉
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
