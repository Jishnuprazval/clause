import { DetectedClause } from '../config/db';

export interface RuleDefinition {
  ruleId: string;
  category: string;
  name: string;
  defaultSeverity: 'critical' | 'high' | 'medium' | 'low';
  patterns: RegExp[];
  explanationTemplate: string;
  whyItMatters: string;
  suggestedQuestions: string[];
  suggestedNegotiation: string;
}

export const CONTRACT_RULES: RuleDefinition[] = [
  {
    ruleId: 'RULE-01-SERVICE-BOND',
    category: 'Service Bond & Early Exit Penalties',
    name: 'Mandatory Service Bond / Tenure Penalty',
    defaultSeverity: 'critical',
    patterns: [
      /(?:service\s+bond|mandatory\s+bond|minimum\s+commitment|lock-in\s+period|serve\s+(?:the\s+company\s+)?for\s+a\s+minimum\s+period\s+of)\s*(?:of\s*)?(\d+\s*(?:years?|months?))/i,
      /(?:reimburse|repay|pay\s+(?:a\s+penalty|liquidated\s+damages|sum|fine|amount\s+of))\s*(?:to\s+the\s+company)?\s*(?:of\s*)?(?:[$€£₹]\s*\d[\d,]*(?:\.\d+)?|\d+\s*(?:months?['’]?\s*(?:salary|stipend))|training\s+costs?)/i,
      /(?:agree[s]?\s+(?:and\s+commit[s]?\s+)?to\s+serve|commit[s]?\s+to\s+remain\s+with)\s+the\s+company\s+for\s+(?:a\s+minimum\s+period\s+of|not\s+less\s+than|at\s+least)?\s*\d+\s*(?:months?|years?)/i,
      /(?:in\s+the\s+event\s+of\s+early\s+resignation|if\s+the\s+(?:employee|appointee)\s+leaves\s+prior\s+to|premature\s+departure)[^.\n]{1,120}(?:forfeit|pay\s+(?:a\s+)?penalty|liquidated\s+damages|repay\s+costs)/i,
      /mandatory\s+service\s+bond/i,
    ],
    explanationTemplate: 'Requires a mandatory service period or financial penalty/damages if you depart before the term completes.',
    whyItMatters: 'Service bonds with excessive financial penalties can restrict career mobility and may even be legally unenforceable or coercive depending on jurisdiction.',
    suggestedQuestions: [
      'Is this service bond negotiable to a prorated or shorter period?',
      'Under what exceptional circumstances (health, family emergency, misconduct by employer) is the bond waived?',
      'Can the company provide itemized proof for the exact training or onboarding costs cited in the penalty clause?',
    ],
    suggestedNegotiation: 'Request the removal of the monetary penalty or request a pro-rata reduction for each completed month of service, with clear waivers for termination without cause.',
  },
  {
    ruleId: 'RULE-02-NON-COMPETE',
    category: 'Non-Compete Restrictions',
    name: 'Post-Employment Non-Compete Restriction',
    defaultSeverity: 'high',
    patterns: [
      /(?:shall\s+not|agrees?\s+not\s+to|prohibited\s+from)\s+(?:directly\s+or\s+indirectly\s+)?(?:engage\s+in|work\s+for|render\s+services\s+to|be\s+employed\s+by|compete\s+with)[^.\n]{1,120}(?:competitor|competing\s+business|rival|similar\s+(?:technology\s+)?business)/i,
      /(?:non-compete|covenant\s+not\s+to\s+compete|restrictive\s+covenant)\s*(?:period\s+of)?\s*(?:for\s+a\s+period\s+of)?\s*(\d+\s*(?:months?|years?))/i,
      /(?:following\s+termination|upon\s+cessation\s+of\s+employment)[^.\n]{1,100}(?:shall\s+not\s+solicit|shall\s+not\s+work\s+for|refrain\s+from\s+joining|shall\s+not\s+directly\s+or\s+indirectly)/i,
    ],
    explanationTemplate: 'Restricts you from working with competing businesses or starting a similar enterprise after leaving.',
    whyItMatters: 'Overly broad geographic or temporal non-compete clauses can prevent you from earning a livelihood in your area of expertise. In many jurisdictions, non-competes without financial compensation are void.',
    suggestedQuestions: [
      'What is the precise definition and list of direct competitors covered by this restriction?',
      'Does the company compensate the employee during the non-compete duration (garden leave)?',
      'What is the exact geographic boundary of this non-compete?',
    ],
    suggestedNegotiation: 'Narrow the scope to specifically named direct competitors only, reduce the duration to 3-6 months maximum, or stipulate paid compensation during any post-employment restriction.',
  },
  {
    ruleId: 'RULE-03-AUTO-RENEWAL',
    category: 'Automatic Renewal',
    name: 'Automatic Renewal / Evergreen Clause',
    defaultSeverity: 'medium',
    patterns: [
      /(?:automatically\s+renew|renew\s+automatically|automatically\s+extended)\s+(?:for\s+successive\s+terms?|for\s+an\s+additional\s+term|without\s+notice)/i,
      /unless\s+(?:written\s+)?notice\s+of\s+non-renewal\s+is\s+given\s+at\s+least\s+(\d+\s*(?:days?|months?))\s+prior/i,
      /(?:evergreen\s+clause|perpetual\s+renewal|rollover\s+automatically)/i,
    ],
    explanationTemplate: 'Automatically rolls over the agreement for another term unless you cancel within a strict, specific notice window.',
    whyItMatters: 'If you miss the narrow notice deadline, you may get trapped into another full billing cycle or term commitment with unwanted financial obligations.',
    suggestedQuestions: [
      'Will the service send a written reminder 30 days prior to the auto-renewal deadline?',
      'What is the process to cancel before renewal, and can it be done via digital notification or self-service dashboard?',
    ],
    suggestedNegotiation: 'Modify the renewal to require explicit affirmative mutual written consent rather than silent automatic extension.',
  },
  {
    ruleId: 'RULE-04-UNILATERAL-MODIFICATION',
    category: 'Unilateral Modification',
    name: 'Unilateral Amendment of Terms',
    defaultSeverity: 'high',
    patterns: [
      /(?:company|employer|provider|service\s+provider)\s+reserves?\s+the\s+right\s+to\s+(?:modify|amend|alter|change|update)/i,
      /(?:at\s+its\s+sole\s+discretion|sole\s+and\s+absolute\s+discretion)\s+to\s+(?:alter|revise|terminate|substitute|modify)/i,
      /(?:continued\s+use|continued\s+employment|continued\s+performance)\s+shall\s+constitute\s+(?:your\s+)?acceptance/i,
      /unilateral\s+amendment/i,
    ],
    explanationTemplate: 'Permits one party to modify agreement terms, compensation, or job scope unilaterally without requiring your active approval.',
    whyItMatters: 'This creates an imbalance where essential terms (like duties, compensation, or hours) can be altered without renegotiation or your signed consent.',
    suggestedQuestions: [
      'Will material changes require a mutual written addendum signed by both parties?',
      'How much advance written notice will be provided before policy or compensation adjustments take effect?',
    ],
    suggestedNegotiation: 'Add clause: "Material changes to compensation, responsibilities, or binding commitments require prior mutual written agreement by both parties."',
  },
  {
    ruleId: 'RULE-05-SALARY-DEDUCTIONS',
    category: 'Salary Deductions & Withholding',
    name: 'Discretionary Salary Deductions or Withholding',
    defaultSeverity: 'critical',
    patterns: [
      /(?:reserve[s]?\s+the\s+right\s+to\s+deduct|entitled\s+to\s+deduct|may\s+withhold)\s+(?:from\s+(?:salary|wages?|compensation|stipend|final\s+payche?ck)|any\s+sums?)/i,
      /(?:deduct(?:ion)?|forfeiture)\s+for\s+(?:alleged\s+)?(?:damages?|losses?|misconduct|errors?|shortages?|breakage|negligence)/i,
      /(?:forfeiture\s+of\s+(?:unpaid\s+)?(?:salary|bonus|incentives|wages?)|fine\s+or\s+penalty\s+deducted)/i,
      /salary\s+deductions/i,
    ],
    explanationTemplate: 'Gives the employer broad authority to deduct or withhold money from your salary for alleged damages, errors, or disputes.',
    whyItMatters: 'Wages are legally protected earnings. Discretionary employer deductions without independent verification or statutory authorization are often improper and financially destabilizing.',
    suggestedQuestions: [
      'What objective guidelines govern deductions, and is an independent grievance process available?',
      'Does this clause comply with standard statutory wage protection regulations?',
    ],
    suggestedNegotiation: 'Specify that deductions are restricted only to statutory legal obligations (taxes) or mutually agreed advance repayments, excluding unilateral assessments of property damages.',
  },
  {
    ruleId: 'RULE-06-UNPAID-NOTICE-PERIOD',
    category: 'Notice Period & Exit Terms',
    name: 'Excessive or Unpaid Notice Period',
    defaultSeverity: 'high',
    patterns: [
      /(?:notice\s+period\s+of\s+(?:not\s+less\s+than\s+)?(\d+\s*(?:days?|months?))|give\s+(?:at\s+least\s+)?(\d+\s*(?:days?|months?))\s+written\s+notice)/i,
      /(?:without\s+(?:pay|salary|compensation)|unpaid)\s+during\s+the\s+notice\s+period/i,
      /(?:forfeit\s+(?:the\s+last|final)\s+month|salary\s+in\s+lieu\s+of\s+notice\s+payable\s+by\s+(?:employee|intern|appointee))/i,
      /(?:resignation\s+shall\s+not\s+be\s+effective\s+until\s+accepted\s+by\s+the\s+company)/i,
    ],
    explanationTemplate: 'Demands an unusually long notice period (e.g. 60–90+ days) or imposes forfeiture of pay during exit.',
    whyItMatters: 'Prolonged notice periods (such as 90 days for entry-level or junior staff) can deter future employers and create financial uncertainty during career transitions.',
    suggestedQuestions: [
      'Can the notice period be shortened to standard 15-30 days during probation or initial tenure?',
      'Does the employer guarantee full salary and benefits throughout the notice period, including garden leave?',
    ],
    suggestedNegotiation: 'Seek standard reciprocal notice (e.g., 2 weeks to 30 days) and ensure full compensation during any garden leave or transition period.',
  },
  {
    ruleId: 'RULE-07-DATA-SHARING',
    category: 'Data Sharing & Privacy',
    name: 'Overreaching Data Collection & Third-Party Sharing',
    defaultSeverity: 'medium',
    patterns: [
      /(?:reserves?\s+the\s+(?:unconditional|irrevocable)?\s*right\s+to\s+(?:collect|monitor|store|transfer)|share|transfer|sell|disclose)\s+(?:personal\s+data|personal\s+information|biometric|employee\s+records?)/i,
      /(?:share|transfer|sell|disclose)\s+(?:personal\s+data|personal\s+information|biometric\s+data|employee\s+records?)\s+to\s+(?:third\s+parties|affiliates|marketing\s+partners|advertisers)/i,
      /(?:irrevocable|unconditional|perpetual)\s+(?:consent|right)\s+to\s+(?:monitor|record|collect|store)\s+(?:personal\s+communications|personal\s+devices|browsing\s+history|location)/i,
      /(?:cross-border\s+data\s+transfer|without\s+restriction\s+or\s+limitation)\s+of\s+personal\s+(?:data|records)/i,
      /data\s+sharing\s+&\s+personal\s+privacy/i,
    ],
    explanationTemplate: 'Grants extensive rights to collect, track, or share your personal data with third parties or affiliates without explicit per-instance consent.',
    whyItMatters: 'Surrendering broad privacy rights can compromise sensitive personal data, device privacy, and confidentiality.',
    suggestedQuestions: [
      'What categories of employee data are shared with third parties, and for what exact purpose?',
      'Can you provide a clear data protection policy adhering to standard privacy frameworks (GDPR/DPDP)?',
    ],
    suggestedNegotiation: 'Limit data collection and processing strictly to necessary operational employment purposes, barring third-party marketing or commercial transfers.',
  },
  {
    ruleId: 'RULE-08-TERMINATION-RESTRICTIONS',
    category: 'Termination Conditions',
    name: 'Asymmetric or Restrictive Termination Conditions',
    defaultSeverity: 'high',
    patterns: [
      /(?:company|employer)\s+may\s+terminate\s+(?:this\s+agreement\s+)?immediately\s+without\s+(?:cause|notice|severance)/i,
      /(?:employee|contractor|consultant)\s+shall\s+not\s+(?:be\s+entitled\s+to\s+terminate|have\s+the\s+right\s+to\s+resign)\s+during/i,
      /(?:no\s+severance|waive\s+any\s+claims?\s+for\s+wrongful\s+termination|sole\s+discretion\s+to\s+terminate\s+without\s+recourse)/i,
    ],
    explanationTemplate: 'Creates asymmetric termination rights where the employer can terminate instantly without cause, while restricting your exit.',
    whyItMatters: 'Balanced agreements provide bilateral notice and clear grounds for termination with reasonable transition protection.',
    suggestedQuestions: [
      'Is termination without cause subject to mutual reciprocal notice and severance pay?',
      'What specific definitions of "cause" or "misconduct" trigger immediate termination?',
    ],
    suggestedNegotiation: 'Incorporate bilateral notice provisions (equal notice rights for both parties) and a cure period for any alleged performance deficiencies.',
  },
  {
    ruleId: 'RULE-09-IP-OWNERSHIP',
    category: 'Intellectual Property Ownership',
    name: 'Overreaching IP Assignment (Prior & Personal Works)',
    defaultSeverity: 'critical',
    patterns: [
      /(?:all|any\s+and\s+all)\s+(?:inventions|discoveries|ideas|works|intellectual\s+property|copyrights?)\s+(?:conceived|created|developed)\s*(?:whether\s+during\s+or\s+outside|on\s+or\s+off\s+duty|prior\s+to\s+or\s+during|at\s+any\s+time)/i,
      /(?:waive[s]?\s+(?:all\s+)?moral\s+rights|irrevocable\s+assignment\s+of\s+all\s+(?:past,\s*present|future)\s+inventions)/i,
      /(?:including\s+(?:those\s+developed\s+on\s+personal\s+time|outside\s+working\s+hours|using\s+personal\s+equipment))/i,
    ],
    explanationTemplate: 'Claims ownership of inventions, code, or creative work created by you outside work hours or unrelated to company business.',
    whyItMatters: 'An overly broad IP assignment can strip you of rights to personal side projects, pre-existing open-source contributions, or future independent ventures.',
    suggestedQuestions: [
      'Does this assignment exclude personal projects created on personal time and personal devices with no company IP?',
      'How does the company record and carve out pre-existing intellectual property prior to start date?',
    ],
    suggestedNegotiation: 'Insert clear carve-out: "Excludes inventions and works created on the individual\'s own time without using company proprietary assets, trade secrets, or equipment."',
  },
  {
    ruleId: 'RULE-10-LIABILITY-INDEMNITY',
    category: 'Liability & Indemnification',
    name: 'Broad Personal Indemnification & Unlimited Liability',
    defaultSeverity: 'high',
    patterns: [
      /(?:indemnify|hold\s+harmless|defend)\s+(?:the\s+company|employer|client)\s+(?:from\s+and\s+against\s+any\s+and\s+all\s+claims|against\s+all\s+losses|for\s+any\s+damages?)/i,
      /(?:unlimited\s+liability|strictly\s+liable\s+for\s+any\s+consequential|indirect\s+or\s+punitive\s+damages)/i,
      /(?:employee|contractor)\s+shall\s+be\s+(?:solely|personally)\s+liable\s+for\s+(?:any\s+third-party\s+claim|loss\s+of\s+profits)/i,
    ],
    explanationTemplate: 'Imposes heavy, one-sided personal financial responsibility to defend or compensate the other party against legal claims and losses.',
    whyItMatters: 'Unlimited indemnification exposes an employee or contractor to potentially ruinous personal liability for ordinary commercial disputes or third-party claims.',
    suggestedQuestions: [
      'Is the indemnification mutual or covered under company errors and omissions (E&O) insurance?',
      'Can liability be capped at the total compensation received under this agreement?',
    ],
    suggestedNegotiation: 'Cap total liability to the amount of fees paid in the preceding 6–12 months, eliminate consequential/indirect damages, and exclude gross negligence or willful misconduct.',
  },
];

export interface RuleEngineResult {
  detectedClauses: DetectedClause[];
  totalIssues: number;
  severityBreakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  evaluatedRulesCount: number;
}

/**
 * Custom rule-based contract detection engine
 * Analyzes extracted text, flags high-risk clauses, extracts location offsets
 */
export function analyzeContractRules(text: string): RuleEngineResult {
  if (!text || text.trim().length === 0) {
    return {
      detectedClauses: [],
      totalIssues: 0,
      severityBreakdown: { critical: 0, high: 0, medium: 0, low: 0 },
      evaluatedRulesCount: CONTRACT_RULES.length,
    };
  }

  const detectedClauses: DetectedClause[] = [];
  const breakdown = { critical: 0, high: 0, medium: 0, low: 0 };
  const evaluatedRulesCount = CONTRACT_RULES.length;

  // Estimate approximate page boundaries if not explicitly tagged (approx 3000 chars or form-feed per page)
  const pageFormFeeds = text.split('\f');
  const hasPageSplits = pageFormFeeds.length > 1;

  for (const rule of CONTRACT_RULES) {
    let matchedForRule = false;

    for (const pattern of rule.patterns) {
      // Find matches in text
      const regex = new RegExp(pattern.source, 'gi');
      let match: RegExpExecArray | null;

      while ((match = regex.exec(text)) !== null) {
        const fullMatch = match[0];
        const matchIndex = match.index;

        // Contextual window: expand around match to capture full sentence / clause context (up to 250 chars)
        const contextStart = Math.max(0, text.lastIndexOf('.', matchIndex) + 1);
        let contextEnd = text.indexOf('.', matchIndex + fullMatch.length);
        if (contextEnd === -1) contextEnd = Math.min(text.length, matchIndex + fullMatch.length + 120);
        else contextEnd = Math.min(text.length, contextEnd + 1);

        const clauseText = text.substring(contextStart, contextEnd).trim();

        // Check for duplicates/overlapping matches for this rule
        const isDuplicate = detectedClauses.some(
          d => d.ruleId === rule.ruleId && Math.abs(d.startIndex - matchIndex) < 150
        );

        if (!isDuplicate) {
          // Determine page number
          let pageNumber = 1;
          if (hasPageSplits) {
            let runningLen = 0;
            for (let p = 0; p < pageFormFeeds.length; p++) {
              runningLen += pageFormFeeds[p].length + 1;
              if (matchIndex < runningLen) {
                pageNumber = p + 1;
                break;
              }
            }
          } else {
            pageNumber = Math.max(1, Math.floor(matchIndex / 2500) + 1);
          }

          const clause: DetectedClause = {
            id: `clause_${rule.ruleId}_${detectedClauses.length + 1}`,
            ruleId: rule.ruleId,
            category: rule.category,
            matchedText: clauseText.length > 10 ? clauseText : fullMatch,
            startIndex: matchIndex,
            endIndex: matchIndex + fullMatch.length,
            pageNumber,
            severity: rule.defaultSeverity,
            explanation: rule.explanationTemplate,
            whyItMatters: rule.whyItMatters,
            suggestedQuestions: [...rule.suggestedQuestions],
            suggestedNegotiation: rule.suggestedNegotiation,
          };

          detectedClauses.push(clause);
          breakdown[rule.defaultSeverity]++;
          matchedForRule = true;
          break; // Stop after first strong match per rule to avoid flooding duplicate paragraphs
        }
      }

      if (matchedForRule) break;
    }
  }

  return {
    detectedClauses,
    totalIssues: detectedClauses.length,
    severityBreakdown: breakdown,
    evaluatedRulesCount,
  };
}
