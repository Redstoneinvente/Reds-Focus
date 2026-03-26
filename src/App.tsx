import * as React from "react";
import { useEffect, useState, useCallback, Component, ErrorInfo, ReactNode } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, orderBy, writeBatch, deleteDoc, updateDoc, getDocFromServer } from "firebase/firestore";
import { auth, db, googleProvider, handleFirestoreError, OperationType } from "./firebase";
import { User, Goal, ActiveSession, Theme, THEMES } from "./types";
import { BADGES, MOTIVATIONAL_QUOTES } from "./constants";
import { cn } from "./lib/utils";
import { LogIn, LogOut, Plus, Play, CheckCircle, Trophy, Settings, Share2, Trash2, GripVertical, Moon, Sun, Monitor, Zap, Coffee, Timer, Layout, Sparkles, Bell, Volume2, VolumeX, Crown, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import confetti from "canvas-confetti";
import { format, parseISO, startOfDay, differenceInDays } from "date-fns";
import { Routes, Route, useNavigate, useParams, useLocation, Navigate } from "react-router-dom";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<any, any> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-8">
          <div className="max-w-md w-full space-y-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h1 className="text-3xl font-black tracking-tighter">Something went wrong</h1>
            <p className="text-slate-400 font-medium leading-relaxed">
              {this.state.error?.message.startsWith('{') 
                ? "A database error occurred. Please check your permissions."
                : this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-white text-black rounded-2xl font-black hover:scale-105 transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

const SpecialEffects = ({ effect }: { effect?: string }) => {
  if (!effect) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-70">
      {effect === "aurora" && (
        <div className="absolute inset-0">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 5, 0],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-transparent blur-[120px]"
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [0, -5, 0],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-1/2 -right-1/2 w-[200%] h-[200%] bg-gradient-to-tl from-purple-500/20 via-blue-500/10 to-transparent blur-[120px]"
          />
        </div>
      )}

      {effect === "nebula" && (
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <motion.div 
              key={i}
              animate={{ 
                scale: [1, 1.5, 1],
                x: [0, 100, 0],
                y: [0, -50, 0],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "linear" }}
              className={cn(
                "absolute w-[800px] h-[800px] rounded-full blur-[150px]",
                i === 0 ? "bg-purple-600/20 top-0 left-0" : 
                i === 1 ? "bg-pink-600/20 bottom-0 right-0" : 
                "bg-blue-600/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              )}
            />
          ))}
        </div>
      )}

      {effect === "matrix" && (
        <div className="absolute inset-0 flex justify-around opacity-20">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -1000 }}
              animate={{ y: 1000 }}
              transition={{ 
                duration: 5 + Math.random() * 10, 
                repeat: Infinity, 
                ease: "linear",
                delay: Math.random() * 5
              }}
              className="text-green-500 font-mono text-xs writing-vertical-rl"
            >
              {Math.random().toString(36).substring(2, 15)}
            </motion.div>
          ))}
        </div>
      )}

      {effect === "snow" && (
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, x: Math.random() * 2000 }}
              animate={{ 
                y: 1200,
                x: (Math.random() * 2000) + (Math.sin(i) * 100)
              }}
              transition={{ 
                duration: 10 + Math.random() * 20, 
                repeat: Infinity, 
                ease: "linear",
                delay: Math.random() * 10
              }}
              className="w-1 h-1 bg-white rounded-full blur-[1px]"
            />
          ))}
        </div>
      )}

      {effect === "rain" && (
        <div className="absolute inset-0">
          {[...Array(100)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -100, x: Math.random() * 2000 }}
              animate={{ y: 1200 }}
              transition={{ 
                duration: 0.5 + Math.random() * 0.5, 
                repeat: Infinity, 
                ease: "linear",
                delay: Math.random() * 2
              }}
              className="w-[1px] h-10 bg-blue-400/30"
            />
          ))}
        </div>
      )}

      {effect === "fireflies" && (
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                x: [Math.random() * 2000, Math.random() * 2000],
                y: [Math.random() * 1000, Math.random() * 1000],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0]
              }}
              transition={{ 
                duration: 5 + Math.random() * 10, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: Math.random() * 5
              }}
              className="w-2 h-2 bg-yellow-400 rounded-full blur-[4px] shadow-[0_0_10px_rgba(250,204,21,0.8)]"
            />
          ))}
        </div>
      )}

      {effect === "glitch" && (
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            animate={{ 
              x: [-10, 10, -5, 5, 0],
              opacity: [0.1, 0.3, 0.1, 0.4, 0.1]
            }}
            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
            className="absolute inset-0 bg-cyan-500/10 mix-blend-screen"
          />
          <motion.div 
            animate={{ 
              x: [10, -10, 5, -5, 0],
              opacity: [0.1, 0.3, 0.1, 0.4, 0.1]
            }}
            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 4 }}
            className="absolute inset-0 bg-fuchsia-500/10 mix-blend-screen"
          />
        </div>
      )}

      {effect === "liquid-glass" && (
        <div className="absolute inset-0 overflow-hidden">
          <svg className="hidden">
            <defs>
              <filter id="liquid-refraction">
                <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="30" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
          </svg>
          
          <div className="absolute inset-0" style={{ filter: 'url(#liquid-refraction)' }}>
            {/* Animated Refractive Blobs */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  x: [0, 200, -150, 0],
                  y: [0, -150, 200, 0],
                  scale: [1, 1.5, 0.7, 1],
                  rotate: [0, 120, 240, 360],
                }}
                transition={{
                  duration: 40 + i * 15,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className={cn(
                  "absolute w-[900px] h-[900px] rounded-full blur-[140px] opacity-[0.4] mix-blend-soft-light",
                  i % 4 === 0 ? "bg-white" : 
                  i % 4 === 1 ? "bg-blue-300" : 
                  i % 4 === 2 ? "bg-purple-300" : "bg-cyan-200"
                )}
                style={{
                  left: `${(i * 30) % 100}%`,
                  top: `${(i * 20) % 100}%`,
                  filter: "contrast(120%) brightness(110%)",
                }}
              />
            ))}
          </div>
          
          {/* Glass Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          
          {/* Specular Highlights */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/20 pointer-events-none" />
          
          {/* Subtle Color Wash */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] pointer-events-none" />
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>("minimal-dark");
  const [authError, setAuthError] = useState<string | null>(null);
  const [appError, setAppError] = useState<string | null>(null);

  // Safety check for theme
  const themeConfig = THEMES[currentTheme] || THEMES["minimal-dark"];
  const [soundEnabled, setSoundEnabled] = useState(true);
  const navigate = useNavigate();

  // Lifecycle Logging
  useEffect(() => {
    console.log("AppContent mounted");
    return () => console.log("AppContent unmounted");
  }, []);

  // Validate Connection to Firestore
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();
  }, []);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          let userData: User;
          if (userSnap.exists()) {
            userData = userSnap.data() as User;
            if (firebaseUser.email === "pgowardun@gmail.com" && !userData.isPremium) {
              await updateDoc(userRef, { isPremium: true });
              userData.isPremium = true;
            }
          } else {
            userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "",
              photoURL: firebaseUser.photoURL || "",
              streak: 0,
              totalGoalsCompleted: 0,
              isPremium: firebaseUser.email === "pgowardun@gmail.com",
              currentTheme: "minimal-dark",
              badges: [],
            };
            await setDoc(userRef, userData);
          }
          setUser(userData);
          const savedTheme = userData.currentTheme as Theme;
          if (THEMES[savedTheme]) {
            setCurrentTheme(savedTheme);
          } else {
            console.warn(`Invalid theme found in user data: ${savedTheme}. Defaulting to minimal-dark.`);
            setCurrentTheme("minimal-dark");
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth listener error:", error);
        setAuthError("Failed to load user data. Please try again.");
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  // Goals Listener
  useEffect(() => {
    if (!user) return;
    const today = format(new Date(), "yyyy-MM-dd");
    const q = query(
      collection(db, "users", user.uid, "goals"),
      where("date", "==", today),
      orderBy("order", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const goalsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
      setGoals(goalsData);
    }, (error) => {
      console.error("Goals listener error:", error);
      setAppError("Lost connection to your goals. Please refresh.");
    });
    return unsubscribe;
  }, [user]);

  // Active Session Listener
  useEffect(() => {
    if (!user) return;
    const sessionRef = doc(db, "users", user.uid, "activeSession", "current");
    const unsubscribe = onSnapshot(sessionRef, (doc) => {
      try {
        if (doc.exists()) {
          const session = doc.data() as ActiveSession;
          setActiveSession(session);
          if (session.status !== "idle") {
            setShowFocusMode(true);
          } else {
            setShowFocusMode(false);
          }
        } else {
          setActiveSession({ uid: user.uid, goalId: null, startTime: null, status: "idle" });
          setShowFocusMode(false);
        }
      } catch (err) {
        console.error("Error processing session update:", err);
      }
    }, (error) => {
      console.error("Session listener error:", error);
      setAppError("Lost connection to your active session. Please refresh.");
    });
    return unsubscribe;
  }, [user]);

  const handleLogin = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login failed", error);
      if (error.code === "auth/unauthorized-domain") {
        setAuthError("This domain is not authorized in the Firebase Console. Please add '" + window.location.hostname + "' to the authorized domains list in your Firebase project.");
      } else {
        setAuthError(error.message);
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const addGoal = async () => {
    if (!user) return;
    if (!user.isPremium && goals.length >= 5) {
      alert("Free tier is limited to 5 goals. Upgrade to Premium for unlimited!");
      return;
    }
    const today = format(new Date(), "yyyy-MM-dd");
    const newGoalRef = doc(collection(db, "users", user.uid, "goals"));
    const newGoal: Goal = {
      id: newGoalRef.id,
      uid: user.uid,
      title: "",
      description: "",
      reminderInterval: 0,
      reward: "",
      completed: false,
      order: goals.length,
      date: today,
    };
    await setDoc(newGoalRef, newGoal);
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    if (!user) return;
    const goalRef = doc(db, "users", user.uid, "goals", id);
    await updateDoc(goalRef, updates);
  };

  const deleteGoal = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "goals", id));
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || !user) return;
    const items: Goal[] = Array.from(goals);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const batch = writeBatch(db);
    items.forEach((item, index) => {
      const ref = doc(db, "users", user.uid, "goals", item.id);
      batch.update(ref, { order: index });
    });
    await batch.commit();
  };

  const startDay = async (goalId: string) => {
    if (!user) return;
    setShowFocusMode(true);
    const newSession: ActiveSession = {
      uid: user.uid,
      goalId,
      startTime: new Date().toISOString(),
      status: "focusing",
    };
    setActiveSession(newSession);
    const sessionRef = doc(db, "users", user.uid, "activeSession", "current");
    await setDoc(sessionRef, newSession);
  };

  const completeGoal = async () => {
    if (!user || !activeSession?.goalId) return;
    
    const goalId = activeSession.goalId;
    const goalRef = doc(db, "users", user.uid, "goals", goalId);
    await updateDoc(goalRef, { completed: true });

    const remainingGoals = goals.filter(g => !g.completed && g.id !== goalId);
    
    if (remainingGoals.length === 0) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      const userRef = doc(db, "users", user.uid);
      const today = format(new Date(), "yyyy-MM-dd");
      
      let newStreak = user.streak;
      if (user.lastCompletedDate) {
        const lastDate = parseISO(user.lastCompletedDate);
        const daysDiff = differenceInDays(startOfDay(new Date()), startOfDay(lastDate));
        
        if (daysDiff === 1) {
          newStreak += 1;
        } else if (daysDiff > 1) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      // Check for badges
      const newBadges = [...(user.badges || [])];
      if (user.totalGoalsCompleted + 1 >= 100 && !newBadges.includes("goals-100")) {
        newBadges.push("goals-100");
      }
      if (newStreak >= 7 && !newBadges.includes("streak-7")) {
        newBadges.push("streak-7");
      }
      if (newStreak >= 30 && !newBadges.includes("streak-30")) {
        newBadges.push("streak-30");
      }
      if (newStreak >= 100 && !newBadges.includes("streak-100")) {
        newBadges.push("streak-100");
      }

      await updateDoc(userRef, {
        streak: newStreak,
        lastCompletedDate: today,
        totalGoalsCompleted: user.totalGoalsCompleted + 1,
        badges: newBadges,
      });
      
      const sessionRef = doc(db, "users", user.uid, "activeSession", "current");
      await updateDoc(sessionRef, { status: "idle", goalId: null });
    } else {
      const sessionRef = doc(db, "users", user.uid, "activeSession", "current");
      await updateDoc(sessionRef, { status: "reward" });
    }
  };

  const selectNextGoal = async (goalId: string) => {
    if (!user) return;
    setShowFocusMode(true);
    const update = {
      goalId,
      startTime: new Date().toISOString(),
      status: "focusing",
    };
    if (activeSession) {
      setActiveSession({ ...activeSession, ...update });
    }
    const sessionRef = doc(db, "users", user.uid, "activeSession", "current");
    await updateDoc(sessionRef, update);
  };

  const changeTheme = async (theme: Theme) => {
    if (!user) return;
    setCurrentTheme(theme);
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { currentTheme: theme });
  };

  const shareSession = () => {
    if (!user) return;
    const basePath = import.meta.env.BASE_URL.endsWith("/")
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;
    const url = new URL(`focus/${user.uid}`, `${window.location.origin}${basePath}`).toString();
    navigator.clipboard.writeText(url);
    alert("Shareable URL copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white gap-6">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            rotate: { repeat: Infinity, duration: 2, ease: "linear" },
            scale: { repeat: Infinity, duration: 2, ease: "easeInOut" }
          }}
          className="relative"
        >
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
          <Sparkles className="w-12 h-12 text-blue-500 relative z-10" />
        </motion.div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-[10px] uppercase tracking-[0.4em] font-black text-blue-500/50"
        >
          Loading your focus...
        </motion.p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/focus/:uid" element={<SharedFocusMode theme={currentTheme} />} />
      <Route path="/achievements" element={<Achievements user={user} theme={currentTheme} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/" element={
        appError ? (
          <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-8">
            <div className="max-w-md w-full space-y-6 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
              <h1 className="text-3xl font-black tracking-tighter">Connection Error</h1>
              <p className="text-slate-400 font-medium leading-relaxed">{appError}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-8 py-4 bg-white text-black rounded-2xl font-black hover:scale-105 transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : !user ? (
          <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-xl w-full text-center space-y-12 relative z-10"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ rotate: -10, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/20"
                >
                  <Zap className="w-12 h-12 text-white fill-current" />
                </motion.div>
                <h1 className="text-7xl font-black tracking-tighter leading-none">
                  Daily Focus <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Streak</span>
                </h1>
                <p className="text-xl text-gray-400 font-medium max-w-md mx-auto">
                  Master your day, one goal at a time. Build unstoppable momentum with focus streaks.
                </p>
              </div>
              
              <div className="pt-8 space-y-6">
                {authError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-left max-w-sm mx-auto">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-red-200 leading-relaxed">{authError}</p>
                  </div>
                )}
                <button
                  onClick={handleLogin}
                  className="group relative w-full flex items-center justify-center gap-4 bg-white text-black font-black py-6 px-8 rounded-[2rem] hover:scale-105 transition-all active:scale-95 shadow-2xl shadow-white/10"
                >
                  <LogIn className="w-6 h-6" />
                  <span className="text-xl">Continue with Google</span>
                  <div className="absolute inset-0 rounded-[2rem] ring-1 ring-white/20 group-hover:ring-white/40 transition-all" />
                </button>
              </div>

              <div className="pt-12 grid grid-cols-3 gap-8 text-[10px] uppercase tracking-[0.3em] font-black text-gray-500">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                    <Zap className="w-5 h-5" />
                  </div>
                  Focus
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                    <Trophy className="w-5 h-5" />
                  </div>
                  Streak
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                    <Coffee className="w-5 h-5" />
                  </div>
                  Reward
                </div>
              </div>

              {/* Theme Showcase */}
              <div className="pt-12 space-y-4">
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-gray-600">380+ Premium Themes Included</p>
                <div className="flex flex-wrap justify-center gap-2 max-w-sm mx-auto opacity-40">
                  {Object.values(THEMES).slice(0, 15).map((t, i) => (
                    <div key={i} className={cn("w-4 h-4 rounded-full border border-white/10", t.bg)} />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <motion.div 
            key={currentTheme}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={cn("min-h-screen transition-colors duration-500 relative", themeConfig.bg, themeConfig.text)}
          >
            <SpecialEffects effect={themeConfig.specialEffect} />
            <AnimatePresence>
              {showFocusMode && activeSession && (
                <FocusMode 
                  session={activeSession} 
                  goals={goals} 
                  theme={currentTheme}
                  onComplete={completeGoal}
                  onSelectNext={selectNextGoal}
                  onClose={async () => {
                    const sessionRef = doc(db, "users", user.uid, "activeSession", "current");
                    await updateDoc(sessionRef, { status: "idle", goalId: null });
                  }}
                  soundEnabled={soundEnabled}
                />
              )}
            </AnimatePresence>

            <div className="max-w-3xl mx-auto px-4 py-12 space-y-12 pb-32">
              {/* Header */}
              <header className="flex items-center justify-between">
                <div className="space-y-1">
                  <h1 className="text-4xl font-black tracking-tighter">Today's Focus</h1>
                  <p className={cn("text-sm font-bold uppercase tracking-widest", themeConfig.muted)}>{format(new Date(), "EEEE, MMMM do")}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className={cn("flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-sm shadow-sm border", themeConfig.card)}>
                    <Zap className="w-4 h-4 fill-orange-500 text-orange-500" />
                    {user.streak} Day Streak
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => navigate("/achievements")} 
                      className={cn("p-3 rounded-2xl transition-all hover:scale-110 shadow-sm border", themeConfig.card)}
                    >
                      <Trophy className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setSoundEnabled(!soundEnabled)} 
                      className={cn("p-3 rounded-2xl transition-all hover:scale-110 shadow-sm border", themeConfig.card)}
                    >
                      {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                    <button 
                      onClick={handleLogout} 
                      className={cn("p-3 rounded-2xl transition-all hover:scale-110 shadow-sm border", themeConfig.card)}
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </header>

              {/* Dashboard Quote */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("p-10 rounded-[2.5rem] border text-center space-y-4 shadow-xl", themeConfig.card)}
              >
                {(() => {
                  const q = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
                  return (
                    <>
                      <p className="text-2xl font-black tracking-tight italic">"{q.text}"</p>
                      <p className={cn("text-sm font-bold uppercase tracking-widest", themeConfig.muted)}>— {q.author}</p>
                    </>
                  );
                })()}
              </motion.div>

              {/* Goals List */}
              <section className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black tracking-tight">Your Goals</h2>
                  <div className="flex items-center gap-3">
                    <button onClick={shareSession} className={cn("p-3 rounded-2xl transition-all hover:scale-110 shadow-sm border", themeConfig.card)}>
                      <Share2 className="w-5 h-5" />
                    </button>
                    <ThemeSelector current={currentTheme} onSelect={changeTheme} />
                    <button 
                      onClick={addGoal}
                      className={cn("flex items-center gap-2 px-6 py-3 rounded-2xl font-black shadow-lg transition-all active:scale-95", themeConfig.button, themeConfig.buttonText)}
                    >
                      <Plus className="w-5 h-5" />
                      Add Goal
                    </button>
                  </div>
                </div>

                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="goals">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
                        {goals.map((goal, index) => (
                          // @ts-ignore
                          <Draggable key={goal.id} draggableId={goal.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={cn(
                                  "group relative rounded-[2rem] p-8 border shadow-sm hover:shadow-xl transition-all",
                                  themeConfig.card
                                )}
                              >
                                <div className="flex items-start gap-6">
                                  <div {...provided.dragHandleProps} className={cn("mt-1 transition-colors", themeConfig.muted)}>
                                    <GripVertical className="w-6 h-6" />
                                  </div>
                                  <div className="flex-1 space-y-6">
                                    <div className="flex items-center gap-4">
                                      <input
                                        type="text"
                                        value={goal.title}
                                        onChange={(e) => updateGoal(goal.id, { title: e.target.value })}
                                        placeholder="What's your goal?"
                                        className={cn(
                                          "flex-1 text-2xl font-black bg-transparent border-none focus:ring-0 p-0 placeholder:opacity-30",
                                          themeConfig.text
                                        )}
                                      />
                                      <button onClick={() => deleteGoal(goal.id)} className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:scale-125 transition-all">
                                        <Trash2 className="w-5 h-5" />
                                      </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="flex items-center gap-3">
                                        <Timer className={cn("w-5 h-5", themeConfig.muted)} />
                                        <input
                                          type="number"
                                          value={goal.reminderInterval || ""}
                                          onChange={(e) => updateGoal(goal.id, { reminderInterval: parseInt(e.target.value) || 0 })}
                                          placeholder="Reminder (mins)"
                                          className={cn(
                                            "w-full bg-black/5 border-none rounded-xl px-4 py-2.5 font-bold focus:ring-2 focus:ring-current",
                                            themeConfig.text
                                          )}
                                        />
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <Coffee className={cn("w-5 h-5", themeConfig.muted)} />
                                        <input
                                          type="text"
                                          value={goal.reward || ""}
                                          onChange={(e) => updateGoal(goal.id, { reward: e.target.value })}
                                          placeholder="Optional reward"
                                          className={cn(
                                            "w-full bg-black/5 border-none rounded-xl px-4 py-2.5 font-bold focus:ring-2 focus:ring-current",
                                            themeConfig.text
                                          )}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                {goals.length === 0 && (
                  <div className={cn("text-center py-24 border-2 border-dashed rounded-[3rem] space-y-6", themeConfig.border)}>
                    <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mx-auto", themeConfig.card)}>
                      <Layout className={cn("w-10 h-10", themeConfig.muted)} />
                    </div>
                    <p className={cn("text-xl font-bold", themeConfig.muted)}>No goals set for today yet.</p>
                  </div>
                )}
              </section>

              {/* Start Day Button */}
              {goals.length > 0 && (
                <div className="pt-12">
                  <button
                    onClick={() => goals[0] && startDay(goals[0].id)}
                    className={cn(
                      "w-full py-7 rounded-[2.5rem] font-black text-2xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4",
                      themeConfig.button,
                      themeConfig.buttonText
                    )}
                  >
                    <Play className="w-8 h-8 fill-current" />
                    Start Your Day
                  </button>
                </div>
              )}

              {/* Premium Upsell */}
              {!user.isPremium && (
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-12 text-white space-y-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                  <div className="flex items-center gap-4 relative">
                    <Crown className="w-10 h-10 text-yellow-400" />
                    <h3 className="text-3xl font-black tracking-tight">Unlock Premium</h3>
                  </div>
                  <ul className="space-y-3 opacity-90 text-lg font-bold relative">
                    <li className="flex items-center gap-3">✓ Unlimited daily goals</li>
                    <li className="flex items-center gap-3">✓ Ultra Premium Liquid-Glass Themes</li>
                    <li className="flex items-center gap-3">✓ Cross-device live sync</li>
                    <li className="flex items-center gap-3">✓ Custom reminder sounds</li>
                  </ul>
                  <div className="flex items-center gap-6 relative">
                    <button className="bg-white text-blue-700 px-8 py-4 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-lg">
                      $3.99/month
                    </button>
                    <button className="bg-blue-500/30 border border-white/20 px-8 py-4 rounded-2xl font-black text-lg hover:bg-white/10 transition-all">
                      $29/year
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )
      } />
    </Routes>
  );
}

function ThemeSelector({ current, onSelect }: { current: Theme; onSelect: (t: Theme) => void }) {
  const [open, setOpen] = useState(false);
  const themeConfig = THEMES[current] || THEMES["minimal-dark"];

  const categories = {
    "Standard": Object.entries(THEMES).filter(([_, t]) => !t.specialEffect),
    "Premium": Object.entries(THEMES).filter(([_, t]) => t.specialEffect && t.specialEffect !== "liquid-glass"),
    "Ultra Premium": Object.entries(THEMES).filter(([_, t]) => t.specialEffect === "liquid-glass")
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className={cn("p-3 rounded-2xl transition-all hover:scale-110 shadow-sm border", themeConfig.card)}
      >
        <Monitor className="w-5 h-5" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-50" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={cn(
                "absolute right-0 mt-4 w-72 max-h-[70vh] overflow-y-auto border rounded-[2rem] shadow-2xl z-[60] p-4 space-y-6 scrollbar-hide",
                themeConfig.card
              )}
            >
              {Object.entries(categories).map(([name, themes]) => (
                <div key={name} className="space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] font-black opacity-50">{name}</h3>
                    {name === "Ultra Premium" && <Sparkles className="w-3 h-3 text-yellow-500" />}
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {themes.map(([key, theme]) => (
                      <button
                        key={key}
                        onClick={() => {
                          onSelect(key as Theme);
                          setOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left group",
                          current === key ? "ring-2 ring-current" : "hover:bg-black/5"
                        )}
                      >
                        <div className={cn("w-10 h-10 rounded-full border-2 shadow-inner transition-transform group-hover:scale-110", theme.bg)} />
                        <div className="flex-1 flex items-center justify-between">
                          <div>
                            <span className="block text-sm font-black tracking-tight">{theme.name}</span>
                            <div className="flex gap-1 mt-1">
                              <div className={cn("w-3 h-3 rounded-full", theme.accent)} />
                              <div className={cn("w-3 h-3 rounded-full", theme.button)} />
                            </div>
                          </div>
                          {theme.specialEffect && (
                            <div className="flex items-center gap-1">
                              {theme.specialEffect === "liquid-glass" ? (
                                <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 animate-pulse" />
                              ) : (
                                <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500/20" />
                              )}
                            </div>
                          )}
                        </div>
                        {current === key && <CheckCircle className="w-5 h-5" />}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function FocusMode({ session, goals, theme, onComplete, onSelectNext, onClose, soundEnabled }: { 
  session: ActiveSession; 
  goals: Goal[]; 
  theme: Theme;
  onComplete: () => void;
  onSelectNext: (id: string) => void;
  onClose: () => void;
  soundEnabled: boolean;
}) {
  const themeConfig = THEMES[theme] || THEMES["minimal-dark"];
  const currentGoal = goals.find(g => g.id === session.goalId);
  const remainingGoals = goals.filter(g => !g.completed && g.id !== session.goalId);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showReminder, setShowReminder] = useState(false);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [quote] = useState(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (session.status === "focusing" && currentGoal?.reminderInterval && currentGoal.reminderInterval > 0) {
      const interval = setInterval(() => {
        setShowReminder(true);
        if (soundEnabled) {
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
          audio.play().catch(() => {});
        }
        setTimeout(() => setShowReminder(false), 5000);
      }, currentGoal.reminderInterval * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [session.status, currentGoal, soundEnabled]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn("fixed inset-0 z-50 flex flex-col p-6 md:p-10 overflow-hidden", themeConfig.bg, themeConfig.text)}
    >
      <SpecialEffects effect={themeConfig.specialEffect} />
      {/* Reminder Popup */}
      <AnimatePresence>
        {showReminder && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className={cn("fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl z-[70] border backdrop-blur-xl", themeConfig.card)}
          >
            <Bell className="w-5 h-5 text-yellow-400 animate-bounce" />
            <span className="font-black text-base tracking-tight">Focus on "{currentGoal?.title}"</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar - Now in Flow */}
      <header className="w-full flex justify-between items-center mb-6 relative z-[60]">
        <div className="flex flex-col">
          <span className={cn("text-[10px] uppercase tracking-[0.2em] font-black opacity-50", themeConfig.muted)}>Started At</span>
          <span className="text-xl md:text-2xl font-black tracking-tighter">{session.startTime ? format(parseISO(session.startTime), "HH:mm") : "--:--"}</span>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6">
          <div className="relative">
            <button 
              onClick={() => setShowPomodoro(!showPomodoro)}
              className={cn("p-3 md:p-4 rounded-2xl md:rounded-3xl transition-all hover:scale-110 shadow-lg", showPomodoro ? themeConfig.button + " " + themeConfig.buttonText : themeConfig.card)}
            >
              <Timer className="w-5 h-5 md:w-7 md:h-7" />
            </button>
            
            {/* Pomodoro Timer - Positioned relative to button to avoid overlap */}
            <AnimatePresence>
              {showPomodoro && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 10, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.9 }}
                  className="absolute right-0 top-full z-[70]"
                >
                  <PomodoroTimer soundEnabled={soundEnabled} theme={theme} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={onClose} className={cn("p-3 md:p-4 rounded-2xl md:rounded-3xl transition-all hover:scale-110 shadow-lg", themeConfig.card)}>
            <Plus className="w-5 h-5 md:w-7 md:h-7 rotate-45" />
          </button>
        </div>

        <div className="flex flex-col items-end">
          <span className={cn("text-[10px] uppercase tracking-[0.2em] font-black opacity-50", themeConfig.muted)}>Current Time</span>
          <span className="text-xl md:text-2xl font-black tracking-tighter">{format(currentTime, "HH:mm:ss")}</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center w-full overflow-y-auto scrollbar-hide">
        <div className="max-w-6xl w-full text-center space-y-8 md:space-y-12 px-4 py-6">
        {session.status === "focusing" ? (
          <>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={currentGoal?.id}
              className="space-y-6"
            >
              <div className="space-y-1">
                <span className={cn("text-[10px] md:text-xs uppercase tracking-[0.4em] font-black opacity-50", themeConfig.muted)}>Current Mission</span>
                <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] break-words hyphens-auto">
                  {currentGoal?.title || "Focusing..."}
                </h2>
              </div>
              
              {currentGoal?.description && (
                <p className={cn("text-lg md:text-xl font-bold max-w-xl mx-auto opacity-70 leading-relaxed", themeConfig.muted)}>
                  {currentGoal.description}
                </p>
              )}

              {/* Day Progress */}
              <div className="max-w-[240px] mx-auto space-y-2 pt-2">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest opacity-50">
                  <span>Day Progress</span>
                  <span>{goals.filter(g => g.completed).length} / {goals.length}</span>
                </div>
                <div className={cn("h-1 w-full rounded-full overflow-hidden", themeConfig.card)}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: goals.length > 0 ? `${(goals.filter(g => g.completed).length / goals.length) * 100}%` : "0%" }}
                    className={cn("h-full", themeConfig.button)}
                  />
                </div>
              </div>
            </motion.div>

            <div className="pt-4">
              <button
                onClick={onComplete}
                className={cn(
                  "group relative px-10 py-5 md:px-16 md:py-8 rounded-[2rem] font-black text-xl md:text-3xl shadow-2xl hover:scale-105 transition-all active:scale-95 flex items-center gap-4 mx-auto overflow-hidden",
                  themeConfig.button, 
                  themeConfig.buttonText
                )}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <CheckCircle className="w-6 h-6 md:w-10 md:h-10" />
                </motion.div>
                Mark Completed
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              className="pt-8 italic text-base md:text-lg font-medium tracking-tight max-w-lg mx-auto leading-relaxed"
            >
              "{quote.text}" — {quote.author}
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-10 md:space-y-12"
          >
            <div className="space-y-4">
              <Trophy className="w-20 h-20 md:w-28 md:h-28 text-yellow-400 mx-auto drop-shadow-2xl" />
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter">Goal Completed!</h2>
              {currentGoal?.reward && (
                <div className={cn("p-6 md:p-8 rounded-[2rem] border inline-block shadow-2xl", themeConfig.card)}>
                  <p className={cn("text-[10px] uppercase tracking-[0.3em] font-black mb-2", themeConfig.muted)}>Your Reward</p>
                  <p className="text-3xl md:text-4xl font-black tracking-tight">☕ {currentGoal.reward}</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <h3 className={cn("text-xl font-black tracking-tight", themeConfig.muted)}>What's next?</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {remainingGoals.map(goal => (
                  <button
                    key={goal.id}
                    onClick={() => onSelectNext(goal.id)}
                    className={cn("px-6 py-4 md:px-8 md:py-5 rounded-[1.5rem] font-black text-lg md:text-xl transition-all hover:scale-105 active:scale-95 border", themeConfig.card)}
                  >
                    {goal.title}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </main>

      {/* Background Animation (Subtle) */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 2, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-current"
        />
      </div>
    </motion.div>
  );
}

function PomodoroTimer({ soundEnabled, theme }: { soundEnabled: boolean; theme: Theme }) {
  const themeConfig = THEMES[theme] || THEMES["minimal-dark"];
  const [mode, setMode] = useState<"work" | "break">("work");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      if (soundEnabled) {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
        audio.play().catch(() => {});
      }
      if (mode === "work") {
        setMode("break");
        setTimeLeft(5 * 60);
      } else {
        setMode("work");
        setTimeLeft(25 * 60);
      }
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, soundEnabled]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("p-8 rounded-[2.5rem] border w-64 text-center space-y-6 shadow-2xl", themeConfig.card)}>
      <div className={cn("text-[10px] uppercase tracking-[0.2em] font-black", themeConfig.muted)}>
        {mode === "work" ? "Focus Phase" : "Break Phase"}
      </div>
      <div className="text-6xl font-mono font-black tracking-tighter">
        {formatTime(timeLeft)}
      </div>
      <div className="flex gap-3">
        <button 
          onClick={() => setIsActive(!isActive)}
          className={cn("flex-1 py-4 rounded-2xl font-black text-sm hover:scale-105 transition-all", themeConfig.button, themeConfig.buttonText)}
        >
          {isActive ? "Pause" : "Start"}
        </button>
        <button 
          onClick={() => {
            setIsActive(false);
            setTimeLeft(mode === "work" ? 25 * 60 : 5 * 60);
          }}
          className={cn("p-4 rounded-2xl transition-all hover:scale-105", themeConfig.card)}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function SharedFocusMode({ theme }: { theme: Theme }) {
  const { uid } = useParams();
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const themeConfig = THEMES[theme] || THEMES["minimal-dark"];

  useEffect(() => {
    if (!uid) return;
    const sessionRef = doc(db, "users", uid, "activeSession", "current");
    const unsubscribeSession = onSnapshot(sessionRef, (doc) => {
      try {
        if (doc.exists()) setSession(doc.data() as ActiveSession);
      } catch (err) {
        console.error("Error processing shared session update:", err);
      }
    }, (error) => {
      console.error("Shared session listener error:", error);
    });

    const today = format(new Date(), "yyyy-MM-dd");
    const q = query(
      collection(db, "users", uid, "goals"),
      where("date", "==", today)
    );
    const unsubscribeGoals = onSnapshot(q, (snapshot) => {
      try {
        setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal)));
      } catch (err) {
        console.error("Error processing shared goals update:", err);
      }
    }, (error) => {
      console.error("Shared goals listener error:", error);
    });

    return () => {
      unsubscribeSession();
      unsubscribeGoals();
    };
  }, [uid]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!session || session.status === "idle") {
    return (
      <div className={cn("min-h-screen flex items-center justify-center", themeConfig.bg, themeConfig.text)}>
        <p className="text-2xl font-black tracking-tighter opacity-50">No active session found.</p>
      </div>
    );
  }

  const currentGoal = goals.find(g => g.id === session.goalId);

  return (
    <div className={cn("min-h-screen flex flex-col items-center justify-center p-8 transition-colors duration-500 relative", themeConfig.bg, themeConfig.text)}>
      <SpecialEffects effect={themeConfig.specialEffect} />
      <div className="absolute top-0 left-0 right-0 p-12 flex justify-between items-center">
        <div className="flex flex-col">
          <span className={cn("text-[10px] uppercase tracking-[0.2em] font-black", themeConfig.muted)}>Started At</span>
          <span className="text-3xl font-black tracking-tighter">{session.startTime ? format(parseISO(session.startTime), "HH:mm") : "--:--"}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className={cn("text-[10px] uppercase tracking-[0.2em] font-black", themeConfig.muted)}>Current Time</span>
          <span className="text-3xl font-black tracking-tighter">{format(currentTime, "HH:mm:ss")}</span>
        </div>
      </div>

      <div className="max-w-5xl w-full text-center space-y-16">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          key={currentGoal?.id}
          className="space-y-6"
        >
          <h2 className="text-8xl md:text-[12rem] font-black tracking-[calc(-0.05em)] leading-none">
            {currentGoal?.title || "Focusing..."}
          </h2>
          <p className={cn("text-2xl md:text-3xl font-bold uppercase tracking-widest", themeConfig.muted)}>Shared Live View</p>
        </motion.div>
      </div>
    </div>
  );
}

function Achievements({ user, theme }: { user: User | null; theme: Theme }) {
  const navigate = useNavigate();
  const themeConfig = THEMES[theme] || THEMES["minimal-dark"];
  if (!user) return null;

  return (
    <motion.div 
      key={theme}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("min-h-screen transition-colors duration-500 p-12", themeConfig.bg, themeConfig.text)}
    >
      <div className="max-w-4xl mx-auto space-y-16">
        <header className="flex items-center gap-8">
          <button 
            onClick={() => navigate("/")}
            className={cn("p-4 rounded-[1.5rem] transition-all shadow-lg hover:scale-110", themeConfig.card)}
          >
            <Plus className="w-8 h-8 rotate-45" />
          </button>
          <h1 className="text-6xl font-black tracking-tighter">Achievements</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Object.values(BADGES).map((badge) => {
            const isUnlocked = user.badges?.includes(badge.id);
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "p-10 rounded-[2.5rem] border transition-all flex items-center gap-8 shadow-xl",
                  isUnlocked 
                    ? themeConfig.card + " border-yellow-500/30" 
                    : themeConfig.card + " opacity-30 grayscale blur-[1px]"
                )}
              >
                <div className="text-6xl drop-shadow-2xl">{badge.icon}</div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tight">{badge.name}</h3>
                  <p className={cn("text-base font-medium leading-relaxed", themeConfig.muted)}>{badge.description}</p>
                  {isUnlocked && (
                    <span className="inline-block mt-4 text-[10px] uppercase tracking-[0.2em] font-black text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20">
                      Unlocked
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className={cn("p-16 rounded-[4rem] border text-center space-y-10 shadow-2xl", themeConfig.card)}>
          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-4">
              <p className={cn("text-xs uppercase tracking-[0.3em] font-black", themeConfig.muted)}>Total Goals</p>
              <p className="text-7xl font-black tracking-tighter">{user.totalGoalsCompleted}</p>
            </div>
            <div className="space-y-4">
              <p className={cn("text-xs uppercase tracking-[0.3em] font-black", themeConfig.muted)}>Best Streak</p>
              <p className="text-7xl font-black tracking-tighter">{user.streak}d</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
