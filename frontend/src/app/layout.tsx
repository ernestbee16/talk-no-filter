import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navigation from '@/components/Navigation';
import Logo from '@/components/Logo';
import Link from 'next/link';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'Talk No Filter — Private, Professional & Confidential Youth SRH Platform',
  description: 'Skip unverified social media rumours. Access direct, confidential, and medically accurate reproductive health and HIV answers from verified practitioners.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable}`}>
      <body className="antialiased min-h-screen flex flex-col bg-[#07131F] text-slate-100">
        <AuthProvider>
          {/* Ambient Background Glows */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] glow-spot-blue rounded-full pointer-events-none -z-10 animate-pulse-ring" />
          <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] glow-spot-cyan rounded-full pointer-events-none -z-10" />

          {/* Top Crisis Emergency Banner */}
          <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-b border-red-500/30 px-4 py-2 text-center text-xs font-medium text-slate-200 flex items-center justify-center space-x-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            <span>Need Immediate Medical Crisis Support or PEP within 72h?</span>
            <a href="tel:114" className="text-red-400 font-black hover:underline ml-1">
              Call RBC Hotline: 114 (Toll-Free)
            </a>
            <span className="hidden sm:inline text-slate-500">|</span>
            <Link href="/emergency" className="hidden sm:inline text-cyan-400 hover:underline font-bold">
              View Emergency Care Center →
            </Link>
          </div>

          {/* Navigation Bar */}
          <Navigation />

          {/* Page Content */}
          <main className="flex-grow flex flex-col">
            {children}
          </main>

          {/* Global Enterprise Healthcare Footer */}
          <footer className="border-t border-slate-800/80 bg-[#050B12] py-12 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
              <div className="space-y-4 md:col-span-2">
                <Logo size="md" showSubtitle={true} />
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed mt-2">
                  Talk No Filter is a national digital health platform built to eliminate youth reliance on unverified social media rumors and peer misinformation. Direct, WHO & RBC verified medical guidance delivered with 100% cryptographic anonymity.
                </p>
                <div className="flex space-x-2 text-[10px] text-cyan-400">
                  <span className="px-2.5 py-1 bg-cyan-950/40 border border-cyan-500/30 rounded-full">✓ Verified RBC Standards</span>
                  <span className="px-2.5 py-1 bg-blue-950/40 border border-blue-500/30 text-blue-300 rounded-full">✓ WHO Evidence-Based</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white mb-4 uppercase tracking-wider">Core Platform</h4>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li><Link href="/ai-assistant" className="hover:text-cyan-400 transition-colors">AI Health Assistant</Link></li>
                  <li><Link href="/symptom-checker" className="hover:text-cyan-400 transition-colors">Symptom Checker</Link></li>
                  <li><Link href="/hiv-resources" className="hover:text-cyan-400 transition-colors">HIV & PEP/PrEP Hub</Link></li>
                  <li><Link href="/clinic-locator" className="hover:text-cyan-400 transition-colors">Clinic Locator</Link></li>
                  <li><Link href="/medications" className="hover:text-cyan-400 transition-colors">Medication Library</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white mb-4 uppercase tracking-wider">Support & Community</h4>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li><Link href="/book" className="hover:text-cyan-400 transition-colors">Book Consultations</Link></li>
                  <li><Link href="/myth-facts" className="hover:text-cyan-400 transition-colors">Myth vs. Fact Hub</Link></li>
                  <li><Link href="/qa" className="hover:text-cyan-400 transition-colors">Anonymous Q&A</Link></li>
                  <li><Link href="/mental-health" className="hover:text-cyan-400 transition-colors">Mental Health Hub</Link></li>
                  <li><Link href="/learn" className="hover:text-cyan-400 transition-colors">Learning Center</Link></li>
                  <li><Link href="/community-stories" className="hover:text-cyan-400 transition-colors">Community Stories</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white mb-4 uppercase tracking-wider">Crisis Hotline</h4>
                <div className="bg-red-950/20 border border-red-500/30 rounded-2xl p-4 space-y-2">
                  <p className="text-[10px] text-red-300 font-bold uppercase tracking-wider">Emergency Hotlines</p>
                  <p className="text-xs font-bold text-red-400">RBC Line: Dial 114</p>
                  <p className="text-xs font-bold text-purple-400">GBV Line: Dial 3580</p>
                  <p className="text-[10px] text-slate-400">Toll-Free 24/7 Support in Rwanda</p>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500">
              <p>&copy; {new Date().getFullYear()} Talk No Filter. Confidential Sexual & Reproductive Health Support for Every Young Person.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Clinical Guidelines</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
