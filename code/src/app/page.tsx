import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full border-b bg-white/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-gray-900">SnapImmi</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <a href="#features" className="hover:text-black transition-colors">Features</a>
            <a href="#pricing" className="hover:text-black transition-colors">Pricing</a>
            <a href="#about" className="hover:text-black transition-colors">About</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-black hover:bg-gray-100 rounded-md transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium bg-black text-white hover:bg-black/90 rounded-md transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-5xl text-center space-y-8">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-gray-200 bg-gray-100 text-gray-900 hover:bg-gray-200">
            v2.2 Now Live
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900">
            The Operating System for <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Visa Consultants
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-600">
            Manage customers, track applications, and automate expiry reminders.
            Built for modern immigration agencies who demand speed and security.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="h-12 px-8 rounded-md bg-black text-white font-medium flex items-center gap-2 hover:bg-black/90 transition-all"
            >
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#demo"
              className="h-12 px-8 rounded-md border border-gray-200 text-gray-700 font-medium flex items-center gap-2 hover:bg-gray-50 transition-all"
            >
              Book Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "CRM & Pipelines", desc: "Track every lead from inquiry to visa grant." },
              { title: "Document Vault", desc: "Secure, bank-grade storage for client passports." },
              { title: "Automated Alerts", desc: "WhatsApp & Email reminders before expiry." }
            ].map((f, i) => (
              <div key={i} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="h-10 w-10 bg-black/5 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-5 w-5 text-black" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t text-center text-sm text-gray-600">
        <p>© 2026 SnapImmi. All rights reserved.</p>
      </footer>
    </div>
  );
}
