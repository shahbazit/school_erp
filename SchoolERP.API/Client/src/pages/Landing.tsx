import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, BarChart3, Users, BookOpen } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-primary-200">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 p-2 rounded-xl text-white shadow-lg shadow-primary-500/30">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">SchoolERP</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-primary-600 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="text-sm font-bold bg-primary-600 text-white px-5 py-2.5 rounded-full shadow-md hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/20 transition-all flex items-center gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #cbd5e1 1px, transparent 0)', backgroundSize: '48px 48px' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-400/20 rounded-full blur-[120px] -z-10"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
            The Future of Education Management
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] text-slate-900 drop-shadow-sm">
            Manage your institution with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">Precision</span> & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">Ease</span>.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            SchoolERP is a comprehensive, cloud-based platform designed to streamline administration, enhance communication, and accelerate learning outcomes.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-primary-600 text-white font-bold rounded-full shadow-xl shadow-primary-600/30 hover:bg-primary-700 hover:shadow-2xl hover:shadow-primary-600/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 text-lg">
              Start for free <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 font-bold rounded-full shadow-md border border-slate-200 hover:border-primary-200 hover:text-primary-600 hover:shadow-lg hover:-translate-y-1 transition-all text-lg flex items-center justify-center">
              Login to workspace
            </Link>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-24 px-6 bg-white relative border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything you need, <br/> in one place.</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Eliminate data silos and fragmented tools. Our unified platform covers every aspect of your educational institution's lifecycle.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Users className="h-6 w-6 text-blue-600" />}
              title="Student Management"
              desc="Comprehensive directories, admission tracking, and academic progress monitoring."
              color="bg-blue-50 border-blue-100"
            />
            <FeatureCard 
              icon={<BarChart3 className="h-6 w-6 text-emerald-600" />}
              title="Financial Controls"
              desc="Automated fee collection, expense tracking, and real-time financial reporting."
              color="bg-emerald-50 border-emerald-100"
            />
            <FeatureCard 
              icon={<BookOpen className="h-6 w-6 text-purple-600" />}
              title="Academic Planning"
              desc="Curriculum mapping, timetable generation, and examination management."
              color="bg-purple-50 border-purple-100"
            />
          </div>
        </div>
      </section>
      
      {/* Social Proof / Stats */}
      <section className="py-20 px-6 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center py-12">
            <div>
              <div className="text-5xl font-black mb-2 text-primary-400">500+</div>
              <div className="text-slate-400 uppercase tracking-widest text-xs font-bold">Institutions</div>
            </div>
            <div>
              <div className="text-5xl font-black mb-2 text-primary-400">1M+</div>
              <div className="text-slate-400 uppercase tracking-widest text-xs font-bold">Students Managed</div>
            </div>
            <div>
              <div className="text-5xl font-black mb-2 text-primary-400">99.9%</div>
              <div className="text-slate-400 uppercase tracking-widest text-xs font-bold">Uptime</div>
            </div>
            <div>
              <div className="text-5xl font-black mb-2 text-primary-400">24/7</div>
              <div className="text-slate-400 uppercase tracking-widest text-xs font-bold">Expert Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-950 text-slate-400 border-t border-slate-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
                <div className="flex items-center gap-2 mb-4 text-white">
                  <GraduationCap className="h-6 w-6 text-primary-500" />
                  <span className="text-lg font-bold">SchoolERP</span>
                </div>
                <p className="text-xs text-slate-500 mb-4">Empowering educational institutions worldwide with next-generation management software.</p>
            </div>
            <div>
                <h4 className="text-white font-bold mb-4 text-sm">Product</h4>
                <ul className="space-y-2 text-xs">
                    <li><a href="#" className="hover:text-primary-400">Features</a></li>
                    <li><a href="#" className="hover:text-primary-400">Pricing</a></li>
                    <li><a href="#" className="hover:text-primary-400">Case Studies</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-bold mb-4 text-sm">Company</h4>
                <ul className="space-y-2 text-xs">
                    <li><a href="#" className="hover:text-primary-400">About Us</a></li>
                    <li><a href="#" className="hover:text-primary-400">Careers</a></li>
                    <li><a href="#" className="hover:text-primary-400">Contact</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-bold mb-4 text-sm">Legal</h4>
                <ul className="space-y-2 text-xs">
                    <li><a href="#" className="hover:text-primary-400">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-primary-400">Terms of Service</a></li>
                </ul>
            </div>
        </div>
        <div className="max-w-7xl mx-auto text-center text-xs text-slate-600 border-t border-slate-900 pt-8">
          © {new Date().getFullYear()} SchoolERP. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) {
  return (
    <div className={`p-8 rounded-3xl bg-white border ${color} hover:shadow-xl transition-all group`}>
      <div className={`w-14 h-14 rounded-2xl bg-white border ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
