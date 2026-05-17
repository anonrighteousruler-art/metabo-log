'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Plus, 
  History, 
  AlertTriangle, 
  Dna, 
  Scale, 
  ArrowUpRight, 
  Settings, 
  User, 
  Calendar,
  Zap,
  ShieldCheck,
  ChevronRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';

import { getFirebase } from '@/lib/firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

// --- Types ---
interface UserProfile {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  activityLevel: string;
  healthConditions: string[];
}

interface LogEntry {
  id: string;
  name: string;
  dosage: string;
  type: 'medication' | 'supplement' | 'food' | 'chemical';
  timestamp: Date;
  breakdown?: any;
}

// --- Components ---

const Card = ({ children, className = '', title, icon: Icon }: { children: React.ReactNode, className?: string, title?: string, icon?: any }) => (
  <div className={`bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm ${className}`}>
    {title && (
      <div className="px-6 py-4 border-bottom border-neutral-100 flex items-center justify-between bg-neutral-50/50">
        <h3 className="font-display font-semibold text-neutral-800 flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-neutral-500" />}
          {title}
        </h3>
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </div>
);

const Metric = ({ label, value, unit, icon: Icon, color = 'blue' }: { label: string, value: string | number, unit?: string, icon: any, color?: string }) => (
  <div className="flex items-center gap-4 p-4 rounded-xl border border-neutral-100 bg-white">
    <div className={`p-3 rounded-lg bg-${color}-50 text-${color}-600`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-display font-bold text-neutral-900">
        {value} <span className="text-sm font-normal text-neutral-400">{unit}</span>
      </p>
    </div>
  </div>
);

export default function MetaboTrackApp() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({
    weight: 75,
    height: 180,
    age: 30,
    gender: 'male',
    activityLevel: 'moderate',
    healthConditions: []
  });
  const [rmr, setRmr] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logs' | 'profile'>('dashboard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Harris-Benedict Calculation
  useEffect(() => {
    let base = 0;
    if (profile.gender === 'male') {
      base = 88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * profile.age);
    } else {
      base = 447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * profile.age);
    }
    setRmr(Math.round(base));
  }, [profile]);

  const handleLogin = async () => {
    const { auth } = getFirebase();
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  const addLog = async (name: string, dosage: string, type: any) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      dosage,
      type,
      timestamp: new Date()
    };
    
    setIsAnalyzing(true);
    try {
      // Simulate/Trigger AI Breakdown Calculation
      const res = await fetch('/api/metabolism', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'calculate_breakdown',
          data: { substance: newLog, userProfile: profile }
        })
      });
      const breakdown = await res.json();
      newLog.breakdown = breakdown;
      setLogs([newLog, ...logs]);
      
      // Check for interactions if we have multiple logs
      if (logs.length > 0) {
        const substanceNames = [newLog.name, ...logs.map(l => l.name)];
        const intRes = await fetch('/api/metabolism', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'analyze_interaction',
            data: { substances: substanceNames, userProfile: profile }
          })
        });
        const intData = await intRes.json();
        setInteractions(intData.interactions || []);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
            >
              <Dna className="w-8 h-8 text-blue-600" />
            </motion.div>
            METABOTRACK <span className="text-blue-600">AI</span>
          </h1>
          <p className="text-neutral-500 font-medium text-sm">Pharmacokinetic Intelligence Engine</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-1 p-1 bg-neutral-100 rounded-lg">
            {(['dashboard', 'logs', 'profile'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                  activeTab === tab ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <button className="p-2 rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Metrics & Analysis */}
        <div className="lg:col-span-8 space-y-8">
          
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Top Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Metric label="Resting RMR" value={rmr} unit="kcal/day" icon={Zap} color="orange" />
                  <Metric label="Current Load" value={logs.length} unit="substances" icon={Activity} color="blue" />
                  <Metric label="Risk Level" value={interactions.length > 0 ? 'Elevated' : 'Stable'} icon={ShieldCheck} color={interactions.length > 0 ? 'red' : 'green'} />
                </div>

                {/* Primary Chart */}
                <Card title="Metabolic Concentration Forecast" icon={TrendingDown}>
                  <div className="h-[350px] w-full">
                    {logs.length > 0 && logs[0].breakdown?.timeline ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={logs[0].breakdown.timeline}>
                          <defs>
                            <linearGradient id="colorConc" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="hour" 
                            label={{ value: 'Hours', position: 'insideBottom', offset: -5 }} 
                            stroke="#a3a3a3"
                            fontSize={12}
                          />
                          <YAxis 
                            stroke="#a3a3a3" 
                            fontSize={12} 
                            tickFormatter={(val) => `${val}%`}
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="concentration" 
                            stroke="#2563eb" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorConc)" 
                            animationDuration={1500}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-neutral-400 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                        <Activity className="w-12 h-12 mb-4 opacity-20" />
                        <p className="font-medium">Log a substance to visualize breakdown</p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Interactions Alert */}
                {interactions.length > 0 && (
                  <Card title="AI Interaction Alert" icon={AlertTriangle} className="border-red-100 bg-red-50/10">
                    <div className="space-y-4">
                      {interactions.map((int, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-xl bg-white border border-red-100 shadow-sm">
                          <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                             int.severity === 'High' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                          }`}>
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${
                                int.severity === 'High' ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'
                              }`}>
                                {int.severity} Risk
                              </span>
                            </div>
                            <p className="text-neutral-800 font-semibold mb-1">{int.description}</p>
                            <p className="text-neutral-600 text-sm">{int.recommendation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </motion.div>
            )}

            {activeTab === 'logs' && (
              <motion.div 
                key="logs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-display font-bold">Activity Log</h2>
                  <div className="text-sm text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full font-medium">
                    Total: {logs.length} entries
                  </div>
                </div>
                
                <div className="grid gap-4">
                  {logs.map(log => (
                    <div key={log.id} className="p-5 bg-white border border-neutral-100 rounded-2xl flex items-center justify-between hover:border-blue-200 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                          <History className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                             <h4 className="font-bold text-neutral-900">{log.name}</h4>
                             <span className="text-[10px] uppercase font-bold text-neutral-400 border border-neutral-200 px-1.5 rounded">{log.type}</span>
                          </div>
                          <p className="text-sm text-neutral-500">{log.dosage} • {log.timestamp.toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-neutral-400 mb-1 uppercase tracking-tighter">Est. Half-life</p>
                        <p className="font-display font-black text-neutral-800">{log.breakdown?.halfLife || 'Calculating...'}</p>
                      </div>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="p-12 text-center border-2 border-dashed border-neutral-200 rounded-2xl">
                      <p className="text-neutral-400 font-medium">No substances logged yet today.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Ingestion & Profile */}
        <div className="lg:col-span-4 space-y-8">
          
          <Card title="Quick Ingestion" icon={Plus}>
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              const f = e.target as any;
              addLog(f.name.value, f.dosage.value, f.type.value);
              f.reset();
            }}>
              <div>
                <label className="text-xs font-black uppercase text-neutral-400 mb-2 block tracking-tight">Substance Name</label>
                <input 
                  name="name"
                  type="text" 
                  placeholder="e.g. Acetaminophen, Caffeine" 
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-neutral-300"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-neutral-400 mb-2 block tracking-tight">Dosage</label>
                  <input 
                    name="dosage"
                    type="text" 
                    placeholder="e.g. 500mg" 
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-neutral-400 mb-2 block tracking-tight">Category</label>
                  <select 
                    name="type"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                  >
                    <option value="medication">Medication</option>
                    <option value="food">Food/Drink</option>
                    <option value="supplement">Supplement</option>
                    <option value="chemical">Other</option>
                  </select>
                </div>
              </div>
              <button 
                disabled={isAnalyzing}
                type="submit"
                className="w-full bg-neutral-900 text-white rounded-xl py-3.5 font-bold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                         <Activity className="w-4 h-4" />
                    </motion.div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Record Ingestion
                  </>
                )}
              </button>
            </form>
          </Card>

          <Card title="Physiological Profile" icon={User}>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                  <div className="flex items-center gap-2 mb-2 text-neutral-400">
                    <Scale className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Weight</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-display font-black text-neutral-900">{profile.weight}</span>
                    <span className="text-xs font-bold text-neutral-400 uppercase">kg</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                  <div className="flex items-center gap-2 mb-2 text-neutral-400">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Height</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-display font-black text-neutral-900">{profile.height}</span>
                    <span className="text-xs font-bold text-neutral-400 uppercase">cm</span>
                  </div>
                </div>
              </div>

              <div>
                 <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black uppercase text-neutral-400 tracking-tight">Active Conditions</label>
                    <button className="text-[10px] font-bold text-blue-600 hover:underline">Manage</button>
                 </div>
                 <div className="flex flex-wrap gap-2">
                    {profile.healthConditions.length > 0 ? profile.healthConditions.map((c, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-100">{c}</span>
                    )) : (
                      <span className="text-sm text-neutral-400 italic">None reported</span>
                    )}
                    <button className="px-3 py-1 bg-neutral-50 text-neutral-400 text-xs font-bold rounded-lg border border-neutral-200 border-dashed hover:border-neutral-300">
                      + Add Rule
                    </button>
                 </div>
              </div>

              <div className="pt-4 border-t border-neutral-100">
                 <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-900 text-white">
                    <div className="p-2 bg-neutral-800 rounded-lg">
                      <ShieldCheck className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 leading-none mb-1">Privacy Protocol</p>
                      <p className="text-xs font-medium text-neutral-300">End-to-end encrypted health data</p>
                    </div>
                 </div>
              </div>
            </div>
          </Card>

          {/* AI Insights Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-xl shadow-blue-200 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-8 -mr-8 -mt-8 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Zap className="w-5 h-5 text-blue-200" />
                  </div>
                  <h3 className="font-display font-black tracking-tight text-lg uppercase italic">AI Metabolic Insight</h3>
                </div>
                <p className="text-blue-100 text-sm leading-relaxed mb-6 font-medium">
                  Based on your RMR and current substance profile, your metabolic efficiency is currently peaked. Consider a light 15-min walk to optimize circulation.
                </p>
                <button className="flex items-center gap-2 group text-sm font-black uppercase tracking-widest">
                  View full analysis
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="mt-16 pt-8 border-t border-neutral-200 text-center">
         <p className="text-neutral-400 text-xs font-medium uppercase tracking-widest">
           Built with Google AI & Real-time Pharmacokinetics • {new Date().getFullYear()}
         </p>
      </footer>
    </div>
  );
}
