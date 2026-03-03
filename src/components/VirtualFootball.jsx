import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'

const TEAMS = [
    { name: 'Реал Мадрид', emoji: '🇪🇸' },
    { name: 'Динамо Київ', emoji: '🇺🇦' },
    { name: 'Борусія Д.', emoji: '🇩🇪' },
    { name: 'Челсі', emoji: '🇬🇧' },
    { name: 'Ман Юнайтед', emoji: '🇬🇧' },
    { name: 'ПСЖ', emoji: '🇫🇷' },
    { name: 'Барселона', emoji: '🇪🇸' },
    { name: 'Шахтар Д.', emoji: '🇺🇦' },
    { name: 'Ман Сіті', emoji: '🇬🇧' },
    { name: 'Баварія', emoji: '🇩🇪' },
    { name: 'Ліверпуль', emoji: '🇬🇧' },
    { name: 'Арсенал Л.', emoji: '🇬🇧' },
    { name: 'Бенфіка', emoji: '🇵🇹' },
    { name: 'Спортінг', emoji: '🇵🇹' }
]

const BROADCAST_PHRASES = [
    '🔥 Атака {team}...',
    '🧤 Неймовірний сейв воротаря!',
    '🟨 Жовта картка!',
    '⚽️ ГОООООЛ!',
    '🏃 Швидкий прорив {team} по флангу...',
    '🎯 Небезпечний штрафний удар у воріт {team}!',
    '🛡️ Надійний захист {team} перериває пас.',
    '🚀 Потужний удар здалеку від гравця {team}!',
    '🏟️ Вболівальники несамовито підтримують {team}!',
    '⚠️ Рикошет! М\'яч ледь не влетів у ворота {team}!',
    '⚡️ Контратака {team} на шаленій швидкості!',
    '🧤 Воротар {team} забирає м\'яч!',
    '📐 Кутовий для {team}!'
]

export default function VirtualFootball({ user, isMuted }) {
    const [team1, setTeam1] = useState(null)
    const [team2, setTeam2] = useState(null)
    const [odds, setOdds] = useState({ p1: 0, x: 2.0, p2: 0 })
    const [betAmount, setBetAmount] = useState(10)
    const [selectedResult, setSelectedResult] = useState(null) // 'p1', 'x', 'p2'
    const [isPlaying, setIsPlaying] = useState(false)
    const [broadcast, setBroadcast] = useState('')
    const [score, setScore] = useState([0, 0])
    const [gameResult, setGameResult] = useState(null)
    const [error, setError] = useState('')

    const clickAudio = useRef(new Audio('https://www.soundjay.com/buttons/sounds/button-20.mp3'))
    const whistleAudio = useRef(new Audio('https://www.soundjay.com/misc/sounds/referee-whistle-01.mp3'))
    const goalAudio = useRef(new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-01.mp3'))

    useEffect(() => {
        initMatch()
    }, [])

    const initMatch = () => {
        const shuffled = [...TEAMS].sort(() => 0.5 - Math.random())
        setTeam1(shuffled[0])
        setTeam2(shuffled[1])
        setOdds({
            p1: (Math.random() * (3.0 - 1.5) + 1.5).toFixed(2),
            x: 2.0,
            p2: (Math.random() * (3.0 - 1.5) + 1.5).toFixed(2)
        })
        setScore([0, 0])
        setGameResult(null)
        setBroadcast('Очікуємо на початок матчу...')
        setError('')
    }

    const recordWin = async (reward) => {
        const { error } = await supabase
            .from('profiles')
            .update({
                points: (user.points || 0) + reward
            })
            .eq('id', user.id)
        if (error) console.error('Error recording win:', error)
    }

    const startMatch = async () => {
        if (isPlaying) return

        if (!selectedResult) {
            setError('Виберіть результат! ⚽️')
            return
        }

        if (betAmount <= 0) {
            setError('Введіть суму! 🍋')
            return
        }

        if (betAmount > user.balance) {
            setError('Не вистачає лимонів! 🍋')
            return
        }

        setIsPlaying(true)
        setGameResult(null)
        setScore([0, 0])
        setError('')

        if (!isMuted) whistleAudio.current.play().catch(() => { })

        const { error: deductError } = await supabase
            .from('profiles')
            .update({ balance: user.balance - betAmount })
            .eq('id', user.id)

        if (deductError) {
            console.error(deductError)
            setIsPlaying(false)
            return
        }

        // Determine result
        const actualResult = ['p1', 'x', 'p2'][Math.floor(Math.random() * 3)]
        let finalS1, finalS2
        if (actualResult === 'p1') {
            finalS1 = Math.floor(Math.random() * 3) + 1
            finalS2 = Math.floor(Math.random() * finalS1)
        } else if (actualResult === 'p2') {
            finalS2 = Math.floor(Math.random() * 3) + 1
            finalS1 = Math.floor(Math.random() * finalS2)
        } else {
            finalS1 = finalS2 = Math.floor(Math.random() * 3)
        }

        const totalEvents = 10
        const goalMoments = []
        let goalsToAssign1 = finalS1
        let goalsToAssign2 = finalS2

        const availableIndices = Array.from({ length: totalEvents }, (_, i) => i)

        // Assign goals to random events
        while (goalsToAssign1 > 0 && availableIndices.length > 0) {
            const idx = Math.floor(Math.random() * availableIndices.length)
            goalMoments.push({ team: 1, eventIdx: availableIndices.splice(idx, 1)[0] })
            goalsToAssign1--
        }
        while (goalsToAssign2 > 0 && availableIndices.length > 0) {
            const idx = Math.floor(Math.random() * availableIndices.length)
            goalMoments.push({ team: 2, eventIdx: availableIndices.splice(idx, 1)[0] })
            goalsToAssign2--
        }

        let currentEvent = 0
        let currentS1 = 0
        let currentS2 = 0

        // Timing: 10 events spread over 35s. 
        // Pause between messages: ~3.5s.
        // Event 1 at 2.5s.
        // Last event at 34s.
        // Final whistle at 35s.
        const eventTimes = [2500, 6000, 9500, 13000, 16500, 20000, 23500, 27000, 30500, 34000]

        eventTimes.forEach((time, index) => {
            setTimeout(() => {
                const goal = goalMoments.find(gm => gm.eventIdx === index)
                let phrase
                if (goal) {
                    phrase = `⚽️ ГОООООЛ! ${goal.team === 1 ? team1.name : team2.name} забиває!`
                    if (goal.team === 1) currentS1++
                    else currentS2++
                    setScore([currentS1, currentS2])
                    if (!isMuted) goalAudio.current.play().catch(() => { })
                } else {
                    phrase = BROADCAST_PHRASES[Math.floor(Math.random() * BROADCAST_PHRASES.length)]
                    if (phrase.includes('{team}')) {
                        phrase = phrase.replace('{team}', Math.random() > 0.5 ? team1.name : team2.name)
                    }
                }
                const minute = Math.floor((index + 1) * (90 / totalEvents))
                setBroadcast(`'${minute} хв: ${phrase}`)
            }, time)
        })

        // Final Whistle exactly at 35s
        setTimeout(() => {
            finishMatch(actualResult, [finalS1, finalS2])
        }, 35000)
    }

    const finishMatch = async (actualResult, finalScore) => {
        setScore(finalScore)
        setBroadcast(`🏁 ФІНАЛЬНИЙ СВИСТОК! Рахунок [${finalScore[0]}:${finalScore[1]}]`)
        setIsPlaying(false)

        if (!isMuted) whistleAudio.current.play().catch(() => { })

        const didWin = selectedResult === actualResult
        const multiplier = selectedResult === 'x' ? 2.0 : parseFloat(odds[selectedResult])
        const winAmount = Math.floor(betAmount * multiplier)

        if (didWin) {
            if (!isMuted) goalAudio.current.play().catch(() => { })
            recordWin(winAmount)
        }

        setGameResult({ score: finalScore, win: didWin, amount: didWin ? winAmount : 0 })
    }

    if (!team1 || !team2) return null

    return (
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
            {/* Scoreboard */}
            <div className="w-full bg-gradient-to-b from-green-800 to-green-950 p-6 md:p-10 rounded-[3rem] border-4 border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />

                {/* Visual Field Lines */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-white" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-white rounded-full" />
                </div>

                <div className="relative z-10 flex flex-col items-center gap-8">
                    {/* Teams and Score */}
                    <div className="flex justify-between items-center w-full gap-4">
                        <div className="flex flex-col items-center flex-1">
                            <span className="text-4xl md:text-6xl mb-2">{team1.emoji}</span>
                            <span className="text-sm md:text-xl font-black text-center uppercase tracking-tight">{team1.name}</span>
                        </div>

                        {/* Digital Scoreboard */}
                        <div className="bg-black border-2 border-green-500/30 p-4 md:p-6 rounded-xl flex items-center gap-4 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                            <span className="text-5xl md:text-7xl font-digital font-bold text-green-500 w-12 md:w-16 text-center tabular-nums">
                                {score[0]}
                            </span>
                            <span className="text-3xl md:text-5xl font-digital text-green-800">:</span>
                            <span className="text-5xl md:text-7xl font-digital font-bold text-green-500 w-12 md:w-16 text-center tabular-nums">
                                {score[1]}
                            </span>
                        </div>

                        <div className="flex flex-col items-center flex-1">
                            <span className="text-4xl md:text-6xl mb-2">{team2.emoji}</span>
                            <span className="text-sm md:text-xl font-black text-center uppercase tracking-tight">{team2.name}</span>
                        </div>
                    </div>

                    {/* Broadcast Bar */}
                    <div className="w-full bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-4 min-h-[60px] flex items-center justify-center text-center">
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={broadcast}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-green-400 font-bold italic text-sm md:text-lg"
                            >
                                {broadcast}
                            </motion.p>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Betting Controls */}
            <div className="mt-8 w-full glass p-6 md:p-8 rounded-[2.5rem] border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div>
                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2 block">Сума ставки</label>
                        <div className="flex gap-2">
                            {[10, 50, 100, 500].map(amount => (
                                <button
                                    key={amount}
                                    onClick={() => {
                                        setBetAmount(amount)
                                        if (!isMuted) clickAudio.current.cloneNode().play()
                                    }}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${betAmount === amount ? 'bg-casino-neon text-black' : 'bg-white/5 hover:bg-white/10'}`}
                                >
                                    {amount}
                                </button>
                            ))}
                        </div>
                        <input
                            type="number"
                            value={betAmount}
                            onChange={(e) => setBetAmount(Number(e.target.value))}
                            className="w-full mt-3 bg-black/50 border border-white/10 p-3 rounded-xl text-center font-bold outline-none focus:border-casino-neon"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2 block text-center">Виберіть результат</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setSelectedResult('p1')
                                    if (!isMuted) clickAudio.current.cloneNode().play()
                                }}
                                disabled={isPlaying}
                                className={`flex-1 flex flex-col items-center p-3 rounded-2xl transition-all border ${selectedResult === 'p1' ? 'bg-casino-neon text-black border-transparent scale-105' : 'glass border-white/5 hover:bg-white/5'}`}
                            >
                                <span className="text-[10px] font-black opacity-60">ПЕРЕМОГА 1</span>
                                <span className="text-xl font-black">x{odds.p1}</span>
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedResult('x')
                                    if (!isMuted) clickAudio.current.cloneNode().play()
                                }}
                                disabled={isPlaying}
                                className={`flex-1 flex flex-col items-center p-3 rounded-2xl transition-all border ${selectedResult === 'x' ? 'bg-casino-cyan text-black border-transparent scale-105' : 'glass border-white/5 hover:bg-white/5'}`}
                            >
                                <span className="text-[10px] font-black opacity-60">НІЧИЯ</span>
                                <span className="text-xl font-black">x{odds.x}</span>
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedResult('p2')
                                    if (!isMuted) clickAudio.current.cloneNode().play()
                                }}
                                disabled={isPlaying}
                                className={`flex-1 flex flex-col items-center p-3 rounded-2xl transition-all border ${selectedResult === 'p2' ? 'bg-casino-neon text-black border-transparent scale-105' : 'glass border-white/5 hover:bg-white/5'}`}
                            >
                                <span className="text-[10px] font-black opacity-60">ПЕРЕМОГА 2</span>
                                <span className="text-xl font-black">x{odds.p2}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <motion.button
                    whileHover={!isPlaying && selectedResult && betAmount > 0 ? { scale: 1.02 } : {}}
                    whileTap={!isPlaying && selectedResult && betAmount > 0 ? { scale: 0.98 } : {}}
                    onClick={startMatch}
                    disabled={isPlaying || (betAmount > user.balance && !isPlaying)}
                    className={`w-full mt-8 py-6 rounded-[2rem] font-black text-2xl transition-all uppercase italic tracking-tighter shadow-lg
                        ${isPlaying ? 'bg-neutral-800 text-neutral-500 cursor-wait' : 'bg-green-500 text-black shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:bg-green-400'}
                        ${(!selectedResult || betAmount > user.balance || betAmount <= 0) && !isPlaying ? 'opacity-50 grayscale cursor-not-allowed' : ''}
                    `}
                >
                    {isPlaying ? 'МАТЧ ТРИВАЄ...' : user.balance <= 0 ? 'ПОПОВНИ БАЛАНС! 🍋' : 'ПОЧАТИ МАТЧ ⚽️'}
                </motion.button>
                {(user.balance <= 0 && !isPlaying) && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-4 font-black text-red-500 text-xs">
                        Лимони закінчилися! 🍋 Твий результат збережено в лідерборді. Задонать на банку, щоб отримати нові лимони та піднятися вище!
                    </motion.p>
                )}
                {error && !isPlaying && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-4 font-black text-yellow-500 uppercase italic">
                        {error}
                    </motion.p>
                )}
            </div>

            {/* Result Modal Overlay */}
            <AnimatePresence>
                {gameResult && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="mt-6 w-full text-center"
                    >
                        <div className={`inline-block px-10 py-4 rounded-full font-black text-2xl shadow-xl ${gameResult.win ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black animate-bounce' : 'bg-red-500/20 text-red-500 border border-red-500/50'}`}>
                            {gameResult.win ? `Ви заробили +${gameResult.amount} балів! ⭐` : 'ПРОГРАШ 😔'}
                        </div>
                        <button
                            onClick={initMatch}
                            className="block mx-auto mt-4 text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
                        >
                            Наступний матч ➡️
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
