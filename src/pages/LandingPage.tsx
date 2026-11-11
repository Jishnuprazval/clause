import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  FileCheck2,
  AlertTriangle,
  FileText,
  Search,
  ArrowRight,
  Sparkles,
  Scale,
  Brain,
  ChevronDown,
  CheckCircle2,
  Lock,
  Layers,
  HelpCircle,
  PlayCircle,
  Briefcase,
  Building,
  GraduationCap,
  FileBadge,
} from 'lucide-react';
import { RiskGauge } from '../components/RiskGauge';
import api from '../services/api';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleLaunchDemo = async () => {
    try {
      setLoadingDemo(true);
      const res = await api.post('/contracts/sample');
      if (res.data.success && res.data.analysis) {
        navigate(`/report/${res.data.analysis._id}`);
      }
    } catch (e) {
      navigate('/analyze');
    } finally {
      setLoadingDemo(false);
    }
  };

  const faqs = [
    {
      q: 'How does ClauseRadar detect contract risks?',
      a: 'ClauseRadar uses a dual-engine architecture: a deterministic, rule-based legal detection engine configured with 10 critical risk categories (such as mandatory service bonds, non-compete clauses, salary deductions, and IP ownership), paired with optional Gemini AI integration to translate dense legal language into plain English and formulate negotiation counter-offers.',
    },
    {
      q: 'Will ClauseRadar work if the Gemini AI is unavailable?',
      a: 'Yes, 100%. The rule engine runs autonomously and deterministically on the backend. Even if external AI APIs are unreachable, every risk is identified with exact text offsets, severity calculations, and curated legal explanations.',
    },
    {
      q: 'What types of agreements can I analyze?',
      a: 'ClauseRadar specializes in contracts that individuals frequently encounter: internship offer letters, employment contracts, freelance services, consulting agreements, residential rental leases, and website terms of service.',
    },
    {
      q: 'Does ClauseRadar replace a licensed attorney?',
      a: 'No. ClauseRadar is an educational pre-screening tool designed to help you spot red flags and know which questions to ask before signing. It does not provide formal legal representation or legal advice.',
    },
    {
      q: 'Is my document private and secure?',
      a: 'Yes. Documents are processed in-memory during analysis. Your uploaded files and analyses are associated strictly with your private authenticated account, never shared with third parties or indexed publicly.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent pointer-events-none blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Banner */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-6 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Next-Gen Rule Engine + Plain-English Legal Intelligence</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.15]">
              Understand Every Clause <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Before You Sign.
              </span>
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
              Analyze contracts, identify hidden risks, and make smarter decisions with ClauseRadar. Detect unfair service bonds, broad non-competes, and predatory deductions in seconds.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/analyze"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <span>Analyze Your Contract</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={handleLaunchDemo}
                disabled={loadingDemo}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-base hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <PlayCircle className="w-5 h-5 text-amber-500" />
                <span>{loadingDemo ? 'Loading Demo...' : 'Try Sample Contract'}</span>
              </button>
            </div>

            {/* Trust points */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 10 Built-in Legal Risk Rules
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Real-time In-Document Highlighting
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Side-by-Side Comparison Matrix
              </span>
            </div>
          </div>

          {/* Interactive Live Preview Mockup Card */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            {/* Header / Mac style window bar */}
            <div className="px-5 py-3.5 bg-slate-100/80 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  ClauseRadar Live Inspector – Internship Offer Letter Preview
                </span>
              </div>
              <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2.5 py-0.5 rounded-full border border-red-200 dark:border-red-800">
                82/100 Very High Risk
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
              {/* Document Text Panel */}
              <div className="lg:col-span-7 p-6 bg-slate-50/50 dark:bg-slate-950/40 text-xs text-slate-700 dark:text-slate-300 font-mono space-y-4 leading-relaxed">
                <div className="font-sans font-bold text-sm text-slate-900 dark:text-white">
                  SECTION 3: MANDATORY COMMITMENT & SERVICE BOND
                </div>
                <p>
                  The Appointee agrees to devote 100% of operational hours exclusively to Company tasks.
                  <mark className="bg-red-100 text-red-950 border-b-2 border-red-600 dark:bg-red-950 dark:text-red-200 px-1 py-0.5 rounded font-semibold ml-1 cursor-pointer">
                    Appointee hereby agrees and commits to serve the Company for a minimum period of 24 months (2 years). In the event of early resignation, Appointee agrees to pay a penalty and liquidated damages of $5,000 USD...
                  </mark>
                </p>
                <div className="font-sans font-bold text-sm text-slate-900 dark:text-white pt-2">
                  SECTION 4: NON-COMPETE RESTRICTIONS
                </div>
                <p>
                  <mark className="bg-orange-100 text-orange-950 border-b-2 border-orange-500 dark:bg-orange-950 dark:text-orange-200 px-1 py-0.5 rounded font-semibold cursor-pointer">
                    Following termination, the Appointee shall not directly or indirectly engage in or render services to any competitor for a period of 12 months within a 150-mile radius.
                  </mark>
                </p>
                <div className="font-sans font-bold text-sm text-slate-900 dark:text-white pt-2">
                  SECTION 5: SALARY DEDUCTIONS
                </div>
                <p>
                  <mark className="bg-amber-100 text-amber-950 border-b-2 border-amber-500 dark:bg-amber-950 dark:text-amber-200 px-1 py-0.5 rounded font-semibold cursor-pointer">
                    The Company reserves the right to deduct from salary any sums deemed necessary for alleged damages or equipment breakage at its sole discretion...
                  </mark>
                </p>
              </div>

              {/* Analysis Inspector Panel */}
              <div className="lg:col-span-5 p-6 space-y-5 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Detected Clause Risk</h3>
                    <p className="text-xs text-slate-500">Service Bond & Exit Penalty</p>
                  </div>
                  <RiskGauge score={82} size={70} strokeWidth={7} />
                </div>

                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-700 dark:text-red-400">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>CRITICAL RISK: Mandatory Service Bond</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-normal">
                    Requires a 2-year lock-in with a $5,000 monetary penalty if you leave early. In many jurisdictions, financial exit penalties for interns are legally questionable.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Suggested Questions to Ask:
                  </h4>
                  <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>"Is the bond waived in cases of medical necessity or employer default?"</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>"Can the company provide itemized proof for the $5,000 training fee?"</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    to="/analyze"
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Analyze Full Document</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10 Core Detection Categories Section */}
      <section className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              10 Automated Risk Detectors
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
              ClauseRadar scans agreements against ten specialized legal categories designed to protect signers from one-sided restrictions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Service Bonds & Penalties',
                sev: 'CRITICAL',
                sevColor: 'text-red-600 bg-red-100 dark:bg-red-950/60 dark:text-red-400',
                desc: 'Detects mandatory tenure lock-in periods (e.g. 1–3 years) and liquidated damage fines upon early exit.',
              },
              {
                title: 'Non-Compete Restrictions',
                sev: 'HIGH',
                sevColor: 'text-orange-600 bg-orange-100 dark:bg-orange-950/60 dark:text-orange-400',
                desc: 'Flags restrictions prohibiting you from working with competitor companies or pursuing clients post-resignation.',
              },
              {
                title: 'Discretionary Salary Deductions',
                sev: 'CRITICAL',
                sevColor: 'text-red-600 bg-red-100 dark:bg-red-950/60 dark:text-red-400',
                desc: 'Identifies clauses allowing employers to withhold wages or deduct pay for alleged damages or errors.',
              },
              {
                title: 'Unpaid or Excessive Notice',
                sev: 'HIGH',
                sevColor: 'text-orange-600 bg-orange-100 dark:bg-orange-950/60 dark:text-orange-400',
                desc: 'Flags 60–90+ day notice demands, unpaid exit periods, or forfeitures of your final month stipend.',
              },
              {
                title: 'Overreaching IP Assignment',
                sev: 'CRITICAL',
                sevColor: 'text-red-600 bg-red-100 dark:bg-red-950/60 dark:text-red-400',
                desc: 'Detects clauses seizing ownership of personal side-projects created on your own time without company assets.',
              },
              {
                title: 'Unilateral Modification',
                sev: 'HIGH',
                sevColor: 'text-orange-600 bg-orange-100 dark:bg-orange-950/60 dark:text-orange-400',
                desc: 'Catches provisions allowing one party to alter compensation or obligations without your signed consent.',
              },
              {
                title: 'Unlimited Personal Liability',
                sev: 'HIGH',
                sevColor: 'text-orange-600 bg-orange-100 dark:bg-orange-950/60 dark:text-orange-400',
                desc: 'Highlights one-sided indemnity clauses forcing you to personally compensate the company for business losses.',
              },
              {
                title: 'Automatic Renewal Clauses',
                sev: 'MEDIUM',
                sevColor: 'text-amber-600 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-400',
                desc: 'Identifies evergreen contracts that silently renew into another billing term unless cancelled in narrow windows.',
              },
              {
                title: 'Unrestrained Data Sharing',
                sev: 'MEDIUM',
                sevColor: 'text-amber-600 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-400',
                desc: 'Spots broad permissions granting rights to transfer personal employee data to marketing third parties.',
              },
            ].map((cat, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md ${cat.sevColor}`}>
                    {cat.sev} RISK
                  </span>
                  <span className="text-xs font-mono text-slate-400">Rule 0{i + 1}</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{cat.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            How ClauseRadar Works
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            Three simple steps to decode complex legal documents before committing your signature.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg mb-6">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Upload or Paste</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Drag-and-drop your PDF offer letter, lease agreement, or freelance contract, or paste the text directly into the secure editor.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg mb-6">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Dual-Engine Screening</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Our rule engine flags predatory clauses, assigns transparent risk weights (10, 8, 5, 2 pts), and computes an indicative 0–100 risk score.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg mb-6">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Inspect & Negotiate</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Review colored in-document highlights, read simple English explanations, download PDF summary reports, and use ready-to-send questions.
            </p>
          </div>
        </div>
      </section>

      {/* Target Audience Benefits */}
      <section className="py-20 bg-slate-100/60 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Who Is ClauseRadar For?
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
              Built for people who need to understand what they are signing without paying hundreds in hourly legal fees.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Students & Interns</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Avoid predatory 2-year service bonds and unexpected early exit fines in first-time internship offers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Job Seekers</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Spot excessive non-competes and 90-day notice traps before resigning from your existing position.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/70 text-purple-600 flex items-center justify-center">
                <FileBadge className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Freelancers</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Ensure clients do not seize your pre-existing IP or bind you to unilateral payment withholding.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Tenants & Renters</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Identify unfair security deposit forfeiture clauses and automatic lease renewal obligations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            Got questions? Everything you need to know about ClauseRadar.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-slate-900 dark:text-white text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-blue-600' : ''}`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 bg-blue-600 dark:bg-blue-700 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Never Sign Blindly Again.
          </h2>
          <p className="text-blue-100 text-base max-w-2xl mx-auto">
            Scan your agreement in 30 seconds. Identify red flags, calculate risk score, and get practical counter-negotiation points.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/analyze"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm shadow-lg transition-transform hover:scale-105"
            >
              Start Free Analysis
            </Link>
            <button
              onClick={handleLaunchDemo}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-800/80 hover:bg-blue-800 text-white font-semibold text-sm border border-blue-400/40"
            >
              Load Demo Document
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
