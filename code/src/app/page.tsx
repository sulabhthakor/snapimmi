import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Zap, Globe, Users, LayoutDashboard, FileText } from "lucide-react";

import { auth } from '@/auth';
import { UserMenu } from '@/components/layout/user-menu';

export default async function Home() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-gray-900 selection:text-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold tracking-tight">SnapImmi</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-black transition-colors">Features</a>
            <a href="#solutions" className="hover:text-black transition-colors">Solutions</a>
            <a href="#pricing" className="hover:text-black transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-4">
            {user ? (
              <UserMenu user={user} />
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/login"
                  className="px-5 py-2 text-sm font-medium bg-black text-white rounded-full hover:bg-gray-800 transition-all hover:shadow-lg hover:shadow-gray-200"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          {/* Background Gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-50 pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-gray-50 to-emerald-50 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white/50 backdrop-blur-sm text-xs font-semibold text-gray-600 shadow-sm animate-fade-in-up">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                v2.2 is now live
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
                The Operating System for <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900">
                  Global Mobility
                </span>
              </h1>

              <p className="max-w-2xl mx-auto text-xl text-gray-500 leading-relaxed">
                Streamline visa applications, automate critical reminders, and secure client documents in one powerful platform designed for modern immigration consultancies.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  href="/login"
                  className="h-12 px-8 rounded-full bg-black text-white font-medium flex items-center gap-2 hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-gray-200"
                >
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#demo"
                  className="h-12 px-8 rounded-full border border-gray-200 bg-white text-gray-700 font-medium flex items-center gap-2 hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  Book a Demo
                </Link>
              </div>

              {/* Trust Metrics */}
              <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-gray-100/50 max-w-3xl mx-auto">
                {[
                  { label: "Active Agencies", value: "500+" },
                  { label: "Visas Processed", value: "50k+" },
                  { label: "Success Rate", value: "98%" },
                  { label: "Data Security", value: "ISO 27001" },
                ].map((metric, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">{metric.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid (Bento Style) */}
        <section id="features" className="py-24 bg-gray-50/50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Everything you need to scale</h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                Replace spreadsheets and disjointed tools with a unified workspace built specifically for visa processing workflows.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Feature 1 - Large */}
              <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-blue-100 transition-colors" />
                <div className="relative z-10">
                  <div className="h-12 w-12 bg-black rounded-2xl flex items-center justify-center mb-6">
                    <LayoutDashboard className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Centralized Command Center</h3>
                  <p className="text-gray-500 max-w-md">Get a bird's-eye view of your entire consultancy. Track application statuses, monitor team performance, and manage client communications from a single dashboard.</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 text-gray-900">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Bank-Grade Vault</h3>
                <p className="text-gray-500">Securely store passports and sensitive documents with AES-256 encryption.</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 text-gray-900">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Smart Automation</h3>
                <p className="text-gray-500">Automate expiry reminders via WhatsApp and Email. Never miss a deadline again.</p>
              </div>

              {/* Feature 4 - Large */}
              <div className="md:col-span-2 bg-black rounded-3xl p-8 border border-gray-900 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-64 h-64 bg-gray-800 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-50" />
                <div className="relative z-10">
                  <div className="h-12 w-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">Multi-Tenant Architecture</h3>
                  <p className="text-gray-400 max-w-md">Built for scale. Whether you have 1 office or 50, SnapImmi adapts to your organizational structure with robust permission controls and data isolation.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="bg-gray-900 rounded-[2.5rem] p-12 md:p-24 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800 to-gray-900 opacity-50" />

              <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Ready to modernize your agency?</h2>
                <p className="text-xl text-gray-400">Join top immigration consultants who trust SnapImmi to power their growth.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/login"
                    className="h-14 px-8 rounded-full bg-white text-black font-semibold flex items-center gap-2 hover:bg-gray-100 transition-all"
                  >
                    Get Started Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 bg-white">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-black flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="font-bold text-gray-900">SnapImmi</span>
          </div>
          <div className="text-sm text-gray-500">
            © 2026 SnapImmi Inc. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-black">Privacy</a>
            <a href="#" className="hover:text-black">Terms</a>
            <a href="#" className="hover:text-black">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
