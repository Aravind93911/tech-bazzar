/**
 * TechBazaar - ML-Based SQL Injection Detector
 * Pattern matching + trained dataset similarity analysis
 */
class SQLiDetector {
  constructor() {
    this.patterns = [
      { r: /(\bunion\b.*\bselect\b)/gi, w: 5, n: 'UNION SELECT' },
      { r: /(drop\s+table|truncate\s+table)/gi, w: 5, n: 'Destructive' },
      { r: /(xp_cmdshell|exec\s*\(|execute\s*\()/gi, w: 5, n: 'Command Exec' },
      { r: /('.*\bor\b.*'.*=.*')/gi, w: 5, n: 'OR Tautology' },
      { r: /(;\s*(drop|delete|insert|update|exec))/gi, w: 5, n: 'Piggyback' },
      { r: /(information_schema|sys\.|sysobjects)/gi, w: 4, n: 'Schema Probe' },
      { r: /(waitfor\s+delay|sleep\s*\(|benchmark\s*\()/gi, w: 4, n: 'Time-based' },
      { r: /(@@version|@@servername|version\s*\(\))/gi, w: 3, n: 'Info Gathering' },
      { r: /(\bconvert\s*\(|\bcast\s*\()/gi, w: 2, n: 'Type Conversion' },
      { r: /(\/\*.*?\*\/)/gi, w: 2, n: 'Comment Block' },
      { r: /(--\s*$|#\s*$)/gm, w: 3, n: 'Line Comment' },
      { r: /(having\s+\d+\s*=\s*\d+)/gi, w: 4, n: 'HAVING Inject' },
      { r: /(load_file|into\s+(out|dump)file)/gi, w: 5, n: 'File Access' },
      { r: /'\s*(or|and)\s+\d+\s*=\s*\d+/gi, w: 4, n: 'Numeric Tautology' },
      { r: /(\bunion\b|\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b|\balter\b|\bcreate\b)/gi, w: 2, n: 'SQL Keyword' }
    ];
    this.trainedSqli = [];
    this.refresh();
  }

  refresh() {
    this.trainedSqli = S.dataset
      .filter(d => d.label === 'sqli')
      .map(d => d.input.toLowerCase());
  }

  analyze(input) {
    if (!input || !input.trim()) {
      return { sqli: false, confidence: 0, threats: [], risk: 'none', score: 0 };
    }

    let score = 0;
    let threats = [];
    const low = input.toLowerCase();

    // Pattern matching
    for (const p of this.patterns) {
      const m = input.match(p.r);
      if (m) {
        score += p.w * m.length;
        if (!threats.includes(p.n)) threats.push(p.n);
      }
    }

    // Trained dataset matching
    for (const t of this.trainedSqli) {
      if (low.includes(t) || this.sim(low, t) > 0.7) {
        score += 3;
        if (!threats.includes('ML Pattern')) threats.push('ML Pattern');
      }
    }

    // Extra heuristics
    if ((input.match(/'/g) || []).length > 1) score += 2;
    if (input.includes(';')) score += 1;

    const conf = Math.min((score / 22) * 100, 99.9);

    let risk = 'none';
    if (conf > 80) risk = 'critical';
    else if (conf > 50) risk = 'high';
    else if (conf > 25) risk = 'medium';
    else if (conf > 10) risk = 'low';

    return {
      sqli: conf > 30,
      confidence: Math.round(conf * 10) / 10,
      threats,
      risk,
      score
    };
  }

  sim(a, b) {
    if (a === b) return 1;
    const l = a.length > b.length ? a : b;
    const s = a.length > b.length ? b : a;
    if (!l.length) return 1;
    return (l.length - this.ed(l, s)) / l.length;
  }

  ed(a, b) {
    const m = [];
    for (let i = 0; i <= b.length; i++) {
      m[i] = [i];
      for (let j = 1; j <= a.length; j++) {
        m[i][j] = i === 0 ? j : Math.min(
          m[i - 1][j] + 1,
          m[i][j - 1] + 1,
          m[i - 1][j - 1] + (a[j - 1] === b[i - 1] ? 0 : 1)
        );
      }
    }
    return m[b.length][a.length];
  }
}

const det = new SQLiDetector();
