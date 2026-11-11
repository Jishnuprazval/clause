import React from 'react';
import { ShieldAlert, ShieldCheck, Heart, Github, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">
                Clause<span className="text-blue-500">Radar</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated contract risk highlighter and plain-language assistant empowering students, job seekers, and freelancers to identify restrictive terms before signing.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Client-Privacy Protected</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home Landing</Link>
              </li>
              <li>
                <Link to="/analyze" className="hover:text-white transition-colors">Analyze Document</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-white transition-colors">Contract Comparison</Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-white transition-colors">Analysis History</Link>
              </li>
            </ul>
          </div>

          {/* Contract Types */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Supported Agreements</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="text-slate-400 hover:text-white">Internship Offer Letters</span></li>
              <li><span className="text-slate-400 hover:text-white">Employment Agreements</span></li>
              <li><span className="text-slate-400 hover:text-white">Freelance & Consulting Contracts</span></li>
              <li><span className="text-slate-400 hover:text-white">Residential Rental Leases</span></li>
              <li><span className="text-slate-400 hover:text-white">Vendor & Service Agreements</span></li>
            </ul>
          </div>

          {/* Disclaimer & Legal Notice */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-1">Legal Disclaimer</h4>
            <p className="text-[11px] leading-relaxed text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              ClauseRadar is an automated screening tool utilizing deterministic rule detection and AI plain-language assistance. It is designed solely for informational and educational awareness. It does not provide legal advice and does not substitute for qualified legal counsel.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ClauseRadar. Built for students, professionals, and freelancers.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> & Rule-Engine Intelligence
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
