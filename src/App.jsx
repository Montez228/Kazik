import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import SlotMachine from './components/SlotMachine'
import Leaderboard from './components/Leaderboard'
import AdminPanel from './components/AdminPanel'
import { User, LogIn, Trophy, ShieldAlert, Volume2, VolumeX } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function Home({ isMuted, setIsMuted }) {
  const [user, setUser] = useState(null)
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false)
  const [adminClicks, setAdminClicks] = useState(0)
  const navigate = useNavigate()

  // Real-time subscription for user profile
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`profile-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', table: 'profiles', filter: `id=eq.${user.id}` },
        (payload) => {
          setUser(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!nickname) return
    setLoading(true)

    try {
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('nickname', nickname)
        .single()

      if (error && error.code === 'PGRST116') {
        // Create new profile with 0 spins as requested
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ nickname, spins: 0, points: 0 }])
          .select()
          .single()

        if (createError) throw createError
        profile = newProfile
      } else if (error) throw error

      setUser(profile)
    } catch (err) {
      console.error(err)
      alert('Помилка входу. Спробуйте інший нік або перевірте БД.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-casino-dark text-white p-4 md:p-8 flex flex-col">
      <header className="max-w-6xl mx-auto w-full flex flex-col items-center mb-10 gap-6 md:gap-12 relative">
        {/* Title Block - Always on top */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center w-full"
        >
          <h1
            onClick={() => navigate('/')}
            className="text-4xl md:text-8xl font-black neon-text italic tracking-tighter cursor-pointer select-none uppercase leading-none md:mb-4"
          >
            LEMON GAME 🍋
          </h1>
        </motion.div>

        {/* Profile and Controls Block - Directly below title */}
        <div className="flex flex-col items-center gap-4 w-full justify-center">
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 md:gap-8 glass px-3 md:px-12 py-4 md:py-6 rounded-2xl md:rounded-[3rem] neon-border shadow-[0_0_50px_rgba(240,171,252,0.1)] w-full max-w-[380px] md:max-w-none border border-white/10"
            >
              <div className="text-center flex-1 md:flex-none md:min-w-[140px]">
                <p className="text-[9px] md:text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Гравець</p>
                <p className="font-bold text-casino-neon text-sm md:text-2xl truncate max-w-[90px] md:max-w-[200px] mx-auto">{user.nickname}</p>
              </div>
              <div className="h-10 md:h-14 w-[1px] bg-white/10" />
              <div className="text-center flex-1 md:flex-none md:min-w-[80px]">
                <p className="text-[9px] md:text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Спіни</p>
                <motion.p key={user.spins} initial={{ scale: 1.5, color: '#22d3ee' }} animate={{ scale: 1, color: '#22d3ee' }} className="font-black text-xl md:text-4xl text-center">
                  {user.spins}
                </motion.p>
              </div>
              <div className="h-10 md:h-14 w-[1px] bg-white/10" />
              <div className="text-center flex-1 md:flex-none md:min-w-[80px]">
                <p className="text-[9px] md:text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Бали</p>
                <motion.p key={user.points} initial={{ scale: 1.5, color: '#fbbf24' }} animate={{ scale: 1, color: '#fbbf24' }} className="font-black text-xl md:text-4xl text-center">
                  {user.points}
                </motion.p>
              </div>
            </motion.div>
          )}

          <div className="flex items-center gap-3">
            <button onClick={() => setIsMuted(!isMuted)} className="p-2 md:p-3 glass rounded-full hover:bg-white/10 transition-all border border-white/5">
              {isMuted ? <VolumeX size={16} className="text-red-400 md:w-6 md:h-6" /> : <Volume2 size={16} className="text-casino-neon md:w-6 md:h-6" />}
            </button>
            <span className="text-[8px] md:text-xs text-gray-600 font-bold uppercase tracking-widest">Керування звуком</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {!user ? (
          <div className="lg:col-span-3 flex justify-center items-center py-20">
            <motion.form
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onSubmit={handleLogin}
              className="glass p-10 rounded-[2.5rem] neon-border w-full max-w-md text-center"
            >
              <LogIn className="w-20 h-20 mx-auto mb-6 text-casino-neon" />
              <h2 className="text-3xl font-black mb-6 italic">ЗАРЯДЖЕНІ НА ЛИМОН</h2>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Введіть ваш нік..."
                className="w-full bg-black/50 border border-white/10 p-5 rounded-2xl mb-6 outline-none focus:border-casino-neon text-center text-xl font-bold transition-all"
                autoFocus
              />
              <button disabled={loading} className="w-full bg-casino-neon text-black font-black p-5 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all text-xl shadow-[0_0_20px_rgba(240,171,252,0.4)]">
                {loading ? 'ЗАВАНТАЖЕННЯ...' : 'УВІЙТИ ТА ГРАТИ'}
              </button>
            </motion.form>
          </div>
        ) : (
          <>
            <div className="lg:col-span-2">
              <SlotMachine user={user} isMuted={isMuted} />
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex gap-2">
                <button onClick={() => setShowLeaderboard(true)} className={`flex-1 p-4 rounded-2xl transition-all flex items-center justify-center gap-2 font-bold ${showLeaderboard ? 'bg-casino-neon text-black' : 'glass hover:bg-white/5'}`}>
                  <Trophy size={20} /> ТОП ГРАВЦІВ
                </button>
                <button onClick={() => setShowLeaderboard(false)} className={`flex-1 p-4 rounded-2xl transition-all flex items-center justify-center gap-2 font-bold ${!showLeaderboard ? 'bg-casino-neon text-black' : 'glass hover:bg-white/5'}`}>
                  <ShieldAlert size={20} /> ПРАВИЛА
                </button>
              </div>

              <AnimatePresence mode="wait">
                {showLeaderboard ? <Leaderboard key="top" /> : (
                  <motion.div key="info" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="glass p-8 rounded-[2rem] border border-white/5">
                    <h3 className="text-2xl font-black mb-6 flex items-center gap-2 text-yellow-400 italic">ВИГРАШІ</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-2xl">777</span>
                        <span className="font-black text-casino-neon">500 БАЛІВ</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-2xl">🛸</span>
                        <span className="font-black text-casino-cyan">100 БАЛІВ</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-2xl">🏦</span>
                        <span className="font-black text-casino-cyan">50 БАЛІВ</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-2xl">🍋</span>
                        <span className="font-black text-gray-400">20 БАЛІВ</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-2xl">🍒</span>
                        <span className="font-black text-gray-400">10 БАЛІВ</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Donation Section */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-6 glass rounded-[2rem] border-2 border-yellow-500/20 text-center flex flex-col gap-4 animate-pulse-gold"
              >
                <p className="text-sm font-bold text-yellow-400 uppercase italic">Підтримай ЗСУ / Отримай спіни</p>
                <a
                  href="https://send.monobank.ua/jar/8jDCYuZb7Y"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-yellow-500 text-black font-black py-4 px-6 rounded-2xl text-xl hover:scale-105 active:scale-95 transition-all shadow-lg uppercase leading-none"
                >
                  ЗАРЯДИТИ БАНКУ 🍋
                </a>
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">1 ГРН = 1 СПІН • ВСІ ДОНАТИ ЙДУТЬ НА ПЕРЕМОГУ!</p>
              </motion.div>
            </div>
          </>
        )}
      </main>

      {/* Secret Admin Panel at the bottom */}
      <footer className="mt-auto border-t border-white/5 pt-8">
        <div className="max-w-6xl mx-auto px-4">
          {isAdminUnlocked ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <AdminPanel />
            </motion.div>
          ) : null}
          <p
            onClick={() => {
              setAdminClicks(prev => {
                if (prev + 1 >= 5) {
                  setIsAdminUnlocked(true)
                  return 0
                }
                return prev + 1
              })
            }}
            className="mt-8 text-center text-gray-600 text-sm cursor-default select-none hover:text-gray-500 transition-colors"
          >
            © 2026 ЗАРИДЖЕНІ НА ЛИМОН. ВСІ ПРАВА ЗАХИЩЕНІ.
          </p>
        </div>
      </footer>

      {/* Mobile Sticky Donation Button */}
      <div className="lg:hidden fixed bottom-6 left-0 right-0 px-6 z-40 pointer-events-none">
        <a
          href="https://send.monobank.ua/jar/8jDCYuZb7Y"
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto block w-full bg-yellow-500 text-black font-black py-5 rounded-2xl text-center text-lg shadow-[0_10px_30px_rgba(234,179,8,0.5)] animate-pulse-gold uppercase"
        >
          ЗАРЯДИТИ БАНКУ 🍋
        </a>
      </div>
    </div>
  )
}

function App() {
  const [isMuted, setIsMuted] = useState(false)

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home isMuted={isMuted} setIsMuted={setIsMuted} />} />
        {/* Supporting existing /admin route but preference is bottom of page as requested */}
        <Route path="/admin" element={<div className="min-h-screen bg-black flex items-center justify-center"><AdminPanel /></div>} />
      </Routes>
    </Router>
  )
}

export default App
