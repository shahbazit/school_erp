import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, BarChart3, Users, BookOpen, Brain, Sparkles, Zap, Shield, Globe, Cpu, Layout, Layers, Command, ChevronRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-primary-100">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 p-2 rounded-lg">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">SchoolERP<span className="text-primary-600">.</span>ai</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-10 text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">
            <a href="#features" className="hover:text-primary-600 transition-colors">Solutions</a>
            <a href="#ai-ecosystem" className="hover:text-primary-600 transition-colors">AI Core</a>
            <Link to="/portal" className="hover:text-primary-600 transition-colors">Student Portal</Link>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="hidden sm:block text-xs font-bold text-slate-600 hover:text-primary-600 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="text-xs font-black bg-primary-600 text-white px-6 py-2.5 rounded-full hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 flex items-center gap-2">
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest mb-6 border border-primary-100">
                <Sparkles className="h-3 w-3" />
                Intelligent Institutional OS
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-8 text-slate-900 leading-[1.1]">
                Revolutionizing Education <br className="hidden md:block" /> with <span className="text-primary-600 italic">Advanced AI Engine.</span>
              </h1>
              
              <p className="text-base md:text-lg text-slate-500 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                The first native AI school management system. From predictive student performance to automated financial auditing, we manage the complexity so you can focus on excellence.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/register" className="w-full sm:w-auto px-10 py-4 bg-primary-600 text-white font-black rounded-xl hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary-600/20 text-sm">
                  Register Your School <ChevronRight className="h-4 w-4" />
                </Link>
                <Link to="/portal" className="w-full sm:w-auto px-10 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm shadow-sm">
                  Student Portal
                </Link>
              </div>
            </div>

            <div className="flex-1 w-full max-w-xl lg:max-w-none mx-auto">
               <div className="relative rounded-3xl border-8 border-white bg-white overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] group">
                  <img 
                    src="/assets/hero_school.png" 
                    alt="AI Powered Education" 
                    className="w-full aspect-[1.3] object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/10 to-transparent" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proof Section */}
      <section className="py-10 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatSmall value="98%" label="AI Efficiency" />
            <StatSmall value="150+" label="Partners" />
            <StatSmall value="40%" label="Cost Reduction" />
            <StatSmall value="24/7" label="Global Support" />
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section id="features" className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-primary-600 font-black text-[10px] uppercase tracking-[0.2em] mb-4">Comprehensive Suite</div>
            <h2 className="text-3xl font-black mb-4 tracking-tight">Institutional Excellence at Scale</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm font-medium">Standardize every branch, automate every department, and predict every outcome with our integrated AI modules.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <SolutionCard 
              icon={<Brain className="h-8 w-8" />}
              title="Predictive Student Analytics"
              desc="Early warning systems that identify academic and behavioral trends before they become issues."
              image="/assets/analytics_preview.png"
            />
            <SolutionCard 
              icon={<BarChart3 className="h-8 w-8" />}
              title="Intelligent Financials"
              desc="Deep-learning based fee forecasting, automated reconciliation, and multi-branch auditing tools."
              image="/assets/financials_preview.png"
            />
            <SolutionCard 
              icon={<Shield className="h-8 w-8" />}
              title="Secure Data Governance"
              desc="AES-256 encryption and granular role-based identity management for complete platform safety."
              image="/assets/security_preview.png"
            />
          </div>
        </div>
      </section>

      {/* AI Tutor Feature Highlight (Subtle Version) */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-[3rem] bg-slate-900 p-8 md:p-20 relative overflow-hidden flex flex-col items-center text-center">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-600/10 rounded-full blur-[100px] -z-0"></div>
            <div className="relative z-10 w-full">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                Exclusive Pro Feature
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tighter max-w-3xl mx-auto leading-tight">Interactive AI-Tutor & <br/> <span className="text-primary-500">Curriculum Automation</span></h2>
              <p className="text-slate-400 mb-12 max-w-2xl mx-auto text-base leading-relaxed font-medium">
                Instantly turn textbooks into interactive masterclasses. Generate quizzes, deep-dive summaries, and custom AI chatbots specialized in your school's specific curriculum with a single upload.
              </p>
              <Link to="/portal" className="bg-primary-600 text-white px-10 py-4 rounded-xl font-black shadow-2xl hover:bg-primary-500 transition-all inline-flex items-center gap-3 text-sm uppercase tracking-widest">
                Try AI-Tutor Demo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final Section */}
      <footer className="py-20 px-6 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
           <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-primary-600 p-1.5 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">SchoolERP.ai</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">Built for progressive schools that demand precision, intelligence, and modern administrative speed.</p>
           </div>
           <div>
              <h4 className="text-slate-900 text-[10px] font-black uppercase tracking-[0.15em] mb-6">Core Solutions</h4>
              <ul className="space-y-4 text-xs text-slate-500 font-bold">
                 <li className="hover:text-primary-600 transition-colors cursor-pointer">Student OS</li>
                 <li className="hover:text-primary-600 transition-colors cursor-pointer">Finance Hub</li>
                 <li className="hover:text-primary-600 transition-colors cursor-pointer">Academic AI</li>
              </ul>
           </div>
           <div>
              <h4 className="text-slate-900 text-[10px] font-black uppercase tracking-[0.15em] mb-6">Institution</h4>
              <ul className="space-y-4 text-xs text-slate-500 font-bold">
                 <li className="hover:text-primary-600 transition-colors cursor-pointer">Privacy & GDPR</li>
                 <li className="hover:text-primary-600 transition-colors cursor-pointer">API Partners</li>
                 <li className="hover:text-primary-600 transition-colors cursor-pointer">Live Status</li>
              </ul>
           </div>
           <div>
              <h4 className="text-slate-900 text-[10px] font-black uppercase tracking-[0.15em] mb-6">Next Step</h4>
              <Link to="/register" className="inline-flex items-center gap-2 text-primary-600 font-black text-sm group">
                 Register Institution <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
           </div>
        </div>
        <div className="max-w-7xl mx-auto pt-10 border-t border-slate-100 text-center">
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">© {new Date().getFullYear()} SchoolERP Intelligence Laboratory. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function StatSmall({ value, label }: { value: string, label: string }) {
  return (
    <div className="text-center group">
      <div className="text-2xl md:text-3xl font-black text-slate-900 group-hover:text-primary-600 transition-colors">{value}</div>
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{label}</div>
    </div>
  );
}

function SolutionCard({ icon, title, desc, image }: { icon: React.ReactNode, title: string, desc: string, image?: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-primary-100 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] transition-all h-full flex flex-col group overflow-hidden">
      <div className="bg-slate-50 p-4 rounded-2xl w-fit mb-8 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4 text-slate-900 tracking-tight">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1 font-medium italic opacity-80">{desc}</p>
      
      {image && (
        <div className="mt-4 rounded-2xl overflow-hidden border border-slate-100 shadow-inner">
           <img src={image} alt="Analytics Detail" className="w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100" />
        </div>
      )}
    </div>
  );
}



