import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';
import './HomePage.css';

/* ─── SVG Icon Set ─────────────────────────────────────────── */
const Icon = ({ d, viewBox = '0 0 24 24', ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d={d} />
  </svg>
);

const UsersIcon = (p) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const UserCheckIcon = (p) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>;
const BuildingIcon = (p) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/></svg>;
const TrendingUpIcon = (p) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const SchoolIcon = (p) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>;
const ClipboardIcon = (p) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;
const GraduationIcon = (p) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>;
const TrophyIcon = (p) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
const StarIcon = (p) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const PhoneIcon = (p) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const ArrowRightIcon = (p) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const ChevronLeftIcon = (p) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="15 18 9 12 15 6"/></svg>;
const ChevronRightIcon = (p) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="9 18 15 12 9 6"/></svg>;
const ChevronDownIcon = (p) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="6 9 12 15 18 9"/></svg>;
const PauseIcon = (p) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...p}><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>;
const PlayIcon = (p) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M8 5v14l11-7z"/></svg>;
const CalendarIcon = (p) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const BookOpenIcon = (p) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const PieChartIcon = (p) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>;
const HeartIcon = (p) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const ShieldIcon = (p) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const CheckCircleIcon = (p) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const AlertCircleIcon = (p) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const ClockIcon = (p) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const ActivityIcon = (p) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const BarChartIcon = (p) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const GlobeIcon = (p) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const AwardIcon = (p) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>;
const SparkleIcon = (p) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z"/></svg>;
const ZapIcon = (p) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const RefreshIcon = (p) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;

const QUICK_LINKS = [
  { code: 'AB', label: 'About TVES', desc: 'School profile & history', path: '/about', Icon: SchoolIcon, accent: 'blue' },
  { code: 'AD', label: 'Admissions', desc: 'Enrollment information', path: '/admissions', Icon: ClipboardIcon, accent: 'blue2' },
  { code: 'PR', label: 'Programs & Activities', desc: 'PPAs and events', path: '/ppas', Icon: GraduationIcon, accent: 'green' },
  { code: 'AC', label: 'Accomplishments', desc: 'Awards & achievements', path: '/accomplishments', Icon: TrophyIcon, accent: 'purple' },
  { code: 'SC', label: "Students' Corner", desc: 'Featured students', path: '/students-corner', Icon: StarIcon, accent: 'orange' },
  { code: 'CT', label: 'Contact Us', desc: 'Get in touch', path: '/contact', Icon: PhoneIcon, accent: 'teal' },
];

const ACCOUNTABILITY_LABELS = {
  acc_transparency_seal: 'Transparency Seal',
  acc_aip_wfp_app: 'AIP / WFP / APP',
  acc_saln: 'SALN',
  acc_philgeps: 'PhilGEPS',
  acc_coa_aom: 'COA / AOM',
  acc_foi: 'FOI',
  acc_arta: 'ARTA',
  acc_ccsr_csm: 'CCSR / CSM',
  acc_8888_ccb: '8888 / CCB',
};

/* ─── Intersection Observer hook ──────────────────────────── */
function useInView(threshold = 0.15) {
  const [node, setNode] = useState(null);
  const [inView, setInView] = useState(false);
  const ref = useCallback((el) => { if (el) setNode(el); }, []);
  useEffect(() => {
    if (!node || inView) return;
    if (typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { setInView(true); obs.unobserve(e.target); } });
    }, { threshold, rootMargin: '0px 0px -50px 0px' });
    obs.observe(node);
    return () => obs.disconnect();
  }, [node, threshold, inView]);
  return [ref, inView];
}

/* ─── Count-up animation ────────────────────────────────────── */
function useCountUp(target, start, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start || typeof target !== 'number' || Number.isNaN(target)) return;
    let raf, startTime = null;
    const step = (ts) => {
      if (startTime === null) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration]);
  return value;
}

function KpiValue({ value, start, small, decimals = 0 }) {
  const isNum = typeof value === 'number';
  const count = useCountUp(isNum ? value : 0, start && isNum);
  const display = isNum
    ? (decimals > 0 ? count.toFixed(decimals) : count.toLocaleString())
    : (value || '—');
  return <p className={`kpi-value${small ? ' kpi-value-sm' : ''}`}>{display}</p>;
}

/* ─── Donut Chart ─────────────────────────────────────────── */
function DonutChart({ data, size = 160 }) {
  if (!data?.length) return null;
  const total = data.reduce((s, d) => s + (d.value || 0), 0);
  const R = size / 2 - 14;
  const r = R * 0.56;
  const C = 2 * Math.PI * R;
  let acc = 0;
  const segs = data.map((d, i) => {
    const pct = total ? d.value / total : 0;
    const seg = { ...d, dash: `${C * pct} ${C}`, offset: -C * acc };
    acc += pct;
    return seg;
  });
  const cx = size / 2 + 8, cy = size / 2 + 8;
  return (
    <svg width={size + 16} height={size + 16} viewBox={`0 0 ${size + 16} ${size + 16}`} className="donut-chart">
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--gray-100)" strokeWidth={R - r} />
      {segs.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={R} fill="none" stroke={s.color} strokeWidth={R - r}
          strokeDasharray={s.dash} strokeDashoffset={s.offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 1.3s cubic-bezier(.4,0,.2,1)', transitionDelay: `${i * 0.15}s` }} />
      ))}
      <text x={cx} y={cy - 7} textAnchor="middle" fill="var(--gray-900)" fontSize="17" fontWeight="800">{total.toLocaleString()}</text>
      <text x={cx} y={cy + 11} textAnchor="middle" fill="var(--gray-400)" fontSize="8" fontWeight="700" letterSpacing="0.06em">TOTAL</text>
    </svg>
  );
}

/* ─── Horizontal Bar Chart ───────────────────────────────── */
function HBarChart({ data, animate, keys, colors, labels }) {
  if (!data?.length) return null;
  const maxVal = Math.max(...data.flatMap(d => keys.map(k => d[k] || 0)), 1);
  return (
    <div className="h-bar-chart">
      {data.map((d, i) => (
        <div key={i} className="h-bar-row">
          <div className="h-bar-label">{d.name}</div>
          <div className="h-bar-tracks">
            {keys.map((k, ki) => {
              const w = ((d[k] || 0) / maxVal) * 100;
              return (
                <div key={ki} className="h-bar-track">
                  <div className="h-bar-fill" style={{ width: animate ? `${w}%` : '0%', background: colors[ki], transitionDelay: `${i * 0.05 + ki * 0.08}s` }}>
                    <span className="h-bar-num">{d[k] || 0}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div className="h-bar-legend">
        {keys.map((k, ki) => (
          <span key={ki} className="legend-item"><span className="legend-dot" style={{ background: colors[ki] }} />{labels[ki]}</span>
        ))}
      </div>
    </div>
  );
}

/* ─── Progress Bar ────────────────────────────────────────── */
function ProgressBar({ label, value, max = 100, color, animate }) {
  const pct = Math.min(100, Math.max(0, max ? (value / max) * 100 : 0));
  return (
    <div className="prog-row">
      <div className="prog-meta">
        <span className="prog-label">{label}</span>
        <span className="prog-val" style={{ color }}>{typeof value === 'number' ? `${value.toFixed(1)}%` : value}</span>
      </div>
      <div className="prog-track">
        <div className="prog-fill" style={{ width: animate ? `${pct}%` : '0%', background: color }} />
      </div>
    </div>
  );
}

/* ─── Status Badge ────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    'Completed':   { cls: 'badge-completed',  icon: <CheckCircleIcon style={{ width: 12, height: 12 }} /> },
    'In Progress': { cls: 'badge-inprogress', icon: <ClockIcon style={{ width: 12, height: 12 }} /> },
    'Pending':     { cls: 'badge-pending',    icon: <AlertCircleIcon style={{ width: 12, height: 12 }} /> },
    'Overdue':     { cls: 'badge-overdue',    icon: <AlertCircleIcon style={{ width: 12, height: 12 }} /> },
  };
  const b = map[status] || map['Pending'];
  return <span className={`status-badge ${b.cls}`}>{b.icon}{status}</span>;
}

/* ─── Section Header ─────────────────────────────────────── */
function SectionHeader({ num, eyebrow, title, sub, aside, inView }) {
  return (
    <div className={`sec-label reveal${inView ? ' in-view' : ''}`}>
      <span className="sec-label-num">{num}</span>
      <div className="sec-label-text">
        <span className="sec-label-eyebrow">{eyebrow}</span>
        <h2 className="sec-label-title">{title}</h2>
        {sub && <p className="sec-label-sub">{sub}</p>}
      </div>
      {aside && <div className="sec-label-aside">{aside}</div>}
    </div>
  );
}

/* ─── KPI Card ───────────────────────────────────────────── */
function KpiCard({ icon: IconComp, label, value, accent, start, small, suffix = '', prefix = '', extra }) {
  const isNum = typeof value === 'number';
  const count = useCountUp(isNum ? value : 0, start && isNum);
  const display = isNum ? count.toLocaleString() : (value || '—');
  return (
    <div className={`kpi-card accent-${accent}`}>
      <div className="kpi-card-icon"><IconComp /></div>
      <div className="kpi-card-body">
        <p className="kpi-card-value">{prefix}{display}{suffix}</p>
        <p className="kpi-card-label">{label}</p>
        {extra && <p className="kpi-card-extra">{extra}</p>}
      </div>
    </div>
  );
}

/* ─── Gauge (radial) ─────────────────────────────────────── */
function GaugeChart({ value, max = 100, color, label, animate }) {
  const pct = Math.min(1, Math.max(0, value / max));
  const R = 48; const C = Math.PI * R;
  const dash = animate ? `${C * pct} ${C}` : `0 ${C}`;
  return (
    <div className="gauge-wrap">
      <svg width="120" height="72" viewBox="0 0 120 72" className="gauge-svg">
        <path d="M 12 64 A 48 48 0 0 1 108 64" fill="none" stroke="var(--gray-100)" strokeWidth="10" strokeLinecap="round" />
        <path d="M 12 64 A 48 48 0 0 1 108 64" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={dash} style={{ transition: 'stroke-dasharray 1.4s cubic-bezier(.4,0,.2,1)' }} />
        <text x="60" y="58" textAnchor="middle" fill="var(--gray-900)" fontSize="14" fontWeight="800">{value}%</text>
      </svg>
      <p className="gauge-label">{label}</p>
    </div>
  );
}

/* ─── Live Visitor Pulse — compact nav-bar popover ─────────
   Replaces the old full-width gradient block. Docked in the
   sticky dashboard nav so it stays visible while scrolling
   without competing with the Overview KPIs.                 */
function VisitorPulse({ stats, refreshing }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const STATS = [
    { key: 'active', label: 'Active now', icon: ZapIcon, active: true },
    { key: 'total', label: 'Total visits', icon: TrendingUpIcon },
    { key: 'today', label: 'Today', icon: CalendarIcon },
    { key: 'unique', label: 'Unique', icon: UsersIcon },
  ];

  return (
    <div className="nav-pulse-wrap" ref={wrapRef}>
      <button
        type="button"
        className="nav-pulse-trigger"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen(o => !o)}
      >
        <span className="nav-pulse-dot" />
        <span className="nav-pulse-num">{(stats.active || 0).toLocaleString()}</span>
        <span className="nav-pulse-word">Online</span>
        <ChevronDownIcon className="nav-pulse-chevron" />
      </button>

      {open && (
        <div className="nav-pulse-panel" role="dialog" aria-label="Live site traffic">
          <div className="npp-header">
            <div className="npp-title">
              <span className="npp-title-dot" />
              <span className="npp-title-text">Live Site Traffic</span>
            </div>
            <RefreshIcon className={`npp-refresh${refreshing ? ' spinning' : ''}`} />
          </div>
          <div className="npp-grid">
            {STATS.map(({ key, label, icon: IconComp, active }) => (
              <div key={key} className={`npp-stat${active ? ' npp-stat-active' : ''}`}>
                <span className="npp-stat-icon"><IconComp /></span>
                <div>
                  <div className="npp-stat-num">{(stats[key] || 0).toLocaleString()}</div>
                  <div className="npp-stat-label">{label}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="npp-footer">Updates every 30s · Active window: 2 min</div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const [dashboard, setDashboard] = useState(null);
  const [ppas, setPpas] = useState([]);
  const [loadingDash, setLoadingDash] = useState(true);
  const [banners, setBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  /* ── Live Visitor Counter (data only — rendered via <VisitorPulse/> in the nav bar) ── */
  const [visitorStats, setVisitorStats] = useState({ active: 0, total: 0, today: 0, unique: 0 });
  const [vcRefreshing, setVcRefreshing] = useState(false);

  useEffect(() => {
    api.get('/school-dashboard').then(r => {
      setDashboard(r.data);
      if (r.data?.stats?.updated_at) setLastUpdated(r.data.stats.updated_at);
    }).catch(() => {}).finally(() => setLoadingDash(false));
    api.get('/ppas').then(r => setPpas(r.data.slice(0, 3))).catch(() => {});
    api.get('/banners').then(r => {
      setBanners((r.data || []).filter(b => b.type !== 'general'));
    }).catch(() => {}).finally(() => setBannersLoading(false));
  }, []);

  useEffect(() => {
    if (banners.length <= 1 || !autoplay) return;
    const t = setInterval(() => setCurrentBanner(p => (p + 1) % banners.length), 6000);
    return () => clearInterval(t);
  }, [banners.length, autoplay]);

  const goToBanner = useCallback((i) => { setCurrentBanner(i); setAutoplay(false); }, []);

  /* ── Visitor counter helpers & effects ──────────────────── */
  function getOrCreateToken(key) {
    let t = localStorage.getItem(key);
    if (!t) {
      t = Math.random().toString(36).slice(2) + Date.now().toString(36) + Math.random().toString(36).slice(2);
      try { localStorage.setItem(key, t); } catch (_) {}
    }
    return t;
  }

  useEffect(() => {
    const sessionToken = getOrCreateToken('_tves_sess');
    const visitorToken = getOrCreateToken('_tves_vid');

    const ping = () => {
      api.post('/visitor-stats/ping', { sessionToken, visitorToken }).catch(() => {});
    };
    const fetchStats = () => {
      setVcRefreshing(true);
      api.get('/visitor-stats')
        .then(r => setVisitorStats(r.data || { active: 0, total: 0, today: 0, unique: 0 }))
        .catch(() => {})
        .finally(() => setVcRefreshing(false));
    };

    // Initial calls
    ping();
    fetchStats();

    // Refresh every 30 s
    const pingTimer  = setInterval(ping, 30000);
    const statsTimer = setInterval(fetchStats, 30000);

    return () => {
      clearInterval(pingTimer);
      clearInterval(statsTimer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const prevBanner = useCallback(() => setCurrentBanner(p => (p - 1 + banners.length) % banners.length), [banners.length]);
  const nextBanner = useCallback(() => setCurrentBanner(p => (p + 1) % banners.length), [banners.length]);
  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const s = dashboard?.stats || {};
  const grades = dashboard?.grades || [];

  const computed = useMemo(() => {
    const totalSections = grades.reduce((a, g) => a + (Number(g.sections_count) || 0), 0);
    const totalClassrooms = grades.reduce((a, g) => a + (Number(g.classrooms_count) || 0), 0);
    const enrollment = Number(s.enrollment_count) || 0;
    const avgSection = totalSections > 0 ? Math.round((enrollment / totalSections) * 10) / 10 : 0;
    const totalTeaching = Number(s.teaching_personnel) || 0;
    const totalNonTeaching = Number(s.non_teaching_personnel) || 0;
    const totalAdmin = Number(s.administrative_staff) || 0;
    const totalVacant = Number(s.vacant_positions) || 0;
    const totalPersonnel = totalTeaching + totalNonTeaching + totalAdmin;
    const bmiTotal = (Number(s.bmi_normal) || 0) + (Number(s.bmi_overweight) || 0) + (Number(s.bmi_obese) || 0) + (Number(s.bmi_wasted) || 0);
    const accItems = Object.keys(ACCOUNTABILITY_LABELS);
    const accCompleted = accItems.filter(k => s[k] === 'Completed').length;

    return {
      totalSections, totalClassrooms, enrollment, avgSection,
      totalTeaching, totalNonTeaching, totalAdmin, totalVacant,
      totalPersonnel, bmiTotal, accCompleted,
      accTotal: accItems.length,
    };
  }, [s, grades]);

  const gradeChartData = useMemo(() => grades.map(g => ({
    name: g.grade_level.replace('Grade ', 'G'),
    sections: Number(g.sections_count) || 0,
    classrooms: Number(g.classrooms_count) || 0,
    male: Number(g.male_count) || 0,
    female: Number(g.female_count) || 0,
  })), [grades]);

  const personnelDonut = useMemo(() => {
    const arr = [
      { name: 'Teaching', value: computed.totalTeaching, color: '#2E7D32' },
      { name: 'Non-Teaching', value: computed.totalNonTeaching, color: '#2E7D32' },
      { name: 'Admin', value: computed.totalAdmin, color: '#F4C542' },
    ].filter(d => d.value > 0);
    return arr;
  }, [computed]);

  const bmiDonut = useMemo(() => [
    { name: 'Normal', value: Number(s.bmi_normal) || 0, color: '#2E7D32' },
    { name: 'Overweight', value: Number(s.bmi_overweight) || 0, color: '#F4C542' },
    { name: 'Obese', value: Number(s.bmi_obese) || 0, color: '#C83E36' },
    { name: 'Wasted', value: Number(s.bmi_wasted) || 0, color: '#F4C542' },
  ].filter(d => d.value > 0), [s]);

  const genderDonut = useMemo(() => [
    { name: 'Male', value: Number(s.male_count) || 0, color: '#2E7D32' },
    { name: 'Female', value: Number(s.female_count) || 0, color: '#C83E36' },
  ].filter(d => d.value > 0), [s]);

  // Intersection observers for each section
  const [heroRef, heroInView] = useInView(0.1);
  const [overviewRef, overviewInView] = useInView(0.1);
  const [accessRef, accessInView] = useInView(0.1);
  const [qualityRef, qualityInView] = useInView(0.1);
  const [equityRef, equityInView] = useInView(0.1);
  const [wellRef, wellInView] = useInView(0.1);
  const [hrRef, hrInView] = useInView(0.1);
  const [govRef, govInView] = useInView(0.1);
  const [accRef, accInView] = useInView(0.1);
  const [quickRef, quickInView] = useInView(0.1);
  const [ppaRef, ppaInView] = useInView(0.1);

  const banner = banners[currentBanner];
  const hasBanners = banners.length > 0;

  const fmtDate = (d) => {
    if (!d) return null;
    try { return new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }); } catch { return null; }
  };

  const Skeleton = () => (
    <div className="dashboard-skeleton">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="skel-card">
          <div className="skeleton skel-icon" />
          <div className="skeleton skel-num" />
          <div className="skeleton skel-label" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="homepage">

      {/* ══════════════════════════════════════════════════
          HERO — identity panel + banner slideshow
          ══════════════════════════════════════════════════ */}
      <section className="hero-split"
        onMouseEnter={() => banners.length > 1 && setAutoplay(false)}
        onMouseLeave={() => banners.length > 1 && setAutoplay(true)}>
        <div className="hero-panel">
          <div className="hero-panel-pattern" aria-hidden="true" />
          <div className="hero-panel-glow" aria-hidden="true" />
          <div className="hero-badge-row">
            <span className="hero-badge-pill">Public Elementary School</span>
            <span className="hero-badge-pill hero-badge-pill-gold">DepEd Recognized</span>
          </div>
          <h1 className="hero-headline">Tropical Village Elementary School</h1>
          <p className="hero-tagline">Guiding every learner toward academic excellence, character, and community — one school year at a time.</p>
          <div className="hero-panel-actions">
            <Link to="/admissions" className="btn btn-primary"><span>Enroll Now</span><ArrowRightIcon className="btn-icon" /></Link>
            <button type="button" className="btn btn-outline-light" onClick={() => scrollTo('overview')}>View Dashboard</button>
          </div>
          {s.active_school_year && (
            <div className="hero-sy-badge">
              <CalendarIcon style={{ width: 13, height: 13 }} />
              <span>SY {s.active_school_year}</span>
              <span className={`hero-status-dot ${s.enrollment_status === 'Open' ? 'dot-green' : 'dot-gray'}`} />
              <span>{s.enrollment_status || 'Active'}</span>
            </div>
          )}
        </div>

        <div className="hero-media">
          {bannersLoading ? <div className="hero-skeleton" /> : hasBanners && banner ? (
            <>
              <div className="hero-slide-track">
                {banners.map((b, i) => (
                  <div key={i} className={`hero-slide${i === currentBanner ? ' active' : ''}`}>
                    <img src={getImageUrl(b.image_url)} alt={b.title || ''} className="hero-slide-img" onError={e => { e.target.style.display = 'none'; }} />
                    <div className="hero-slide-overlay" />
                  </div>
                ))}
              </div>
              {banners.length > 1 && (<>
                <button className="hero-nav hero-nav-prev" onClick={prevBanner}><ChevronLeftIcon /></button>
                <button className="hero-nav hero-nav-next" onClick={nextBanner}><ChevronRightIcon /></button>
                <div className="hero-controls">
                  <button className="hero-toggle" onClick={() => setAutoplay(a => !a)}>
                    {autoplay ? <PauseIcon className="hero-toggle-icon" /> : <PlayIcon className="hero-toggle-icon" />}
                  </button>
                  <div className="hero-dots">
                    {banners.map((_, i) => <button key={i} className={`hero-dot${i === currentBanner ? ' active' : ''}`} onClick={() => goToBanner(i)} />)}
                  </div>
                </div>
              </>)}
            </>
          ) : (
            <div className="hero-fallback-media"><div className="hero-fallback-pattern" /></div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          DASHBOARD NAV — quick section jump bar +
          live visitor pulse widget (docked, always visible)
          ══════════════════════════════════════════════════ */}
      <nav className="dash-nav-bar">
        <div className="container">
          <div className="dash-nav-row">
            <div className="dash-nav-inner">
              <span className="dash-nav-label">Dashboard</span>
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'access', label: 'Access' },
                { id: 'quality', label: 'Quality' },
                { id: 'equity', label: 'Equity' },
                { id: 'wellbeing', label: 'Well-Being' },
                { id: 'hr', label: 'HR' },
                { id: 'governance', label: 'Governance' },
                { id: 'accountability', label: 'Accountability' },
              ].map(s => (
                <button key={s.id} className="dash-nav-btn" onClick={() => scrollTo(s.id)}>{s.label}</button>
              ))}
            </div>
            <div className="dash-nav-right">
              {lastUpdated && <span className="dash-updated">Updated {fmtDate(lastUpdated)}</span>}
              <VisitorPulse stats={visitorStats} refreshing={vcRefreshing} />
            </div>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════
          01. OVERVIEW
          ══════════════════════════════════════════════════ */}
      <section id="overview" className="section dash-section" ref={overviewRef}>
        <div className="container">
          <SectionHeader num="01" eyebrow="At a Glance" title="School Overview"
            sub="Key statistics and indicators for the current school year."
            inView={overviewInView}
            aside={<span className="dash-live-badge"><span className="dash-live-dot" />Live Data</span>}
          />

          {loadingDash ? <Skeleton /> : (
            <div className={`reveal${overviewInView ? ' in-view' : ''}`} style={{ transitionDelay: '0.15s' }}>
              {/* Hero KPI row */}
              <div className="overview-hero-tile">
                <div className="ovw-main">
                  <div className="ovw-icon-wrap"><UsersIcon /></div>
                  <div>
                    <KpiValue value={Number(s.enrollment_count) || 0} start={overviewInView} />
                    <p className="kpi-label-white">Total Enrollment</p>
                    {s.active_school_year && <span className="ovw-sy">SY {s.active_school_year}</span>}
                  </div>
                </div>
                <div className="ovw-sub-grid">
                  <div className="ovw-sub-item">
                    <UserCheckIcon className="ovw-sub-icon" />
                    <span className="ovw-sub-num">{Number(s.teaching_personnel) || 0}</span>
                    <span className="ovw-sub-label">Teachers</span>
                  </div>
                  <div className="ovw-sub-item">
                    <BuildingIcon className="ovw-sub-icon" />
                    <span className="ovw-sub-num">{Number(s.non_teaching_personnel) || 0}</span>
                    <span className="ovw-sub-label">Non-Teaching</span>
                  </div>
                  <div className="ovw-sub-item">
                    <BookOpenIcon className="ovw-sub-icon" />
                    <span className="ovw-sub-num">{computed.totalSections}</span>
                    <span className="ovw-sub-label">Sections</span>
                  </div>
                  <div className="ovw-sub-item">
                    <SchoolIcon className="ovw-sub-icon" />
                    <span className="ovw-sub-num">{computed.totalClassrooms}</span>
                    <span className="ovw-sub-label">Classrooms</span>
                  </div>
                </div>
              </div>

              {/* Quick stat cards */}
              <div className="stat-card-grid">
                <KpiCard icon={ActivityIcon} label="Avg Students / Section" value={computed.avgSection} accent="blue2" start={overviewInView} />
                <KpiCard icon={AwardIcon} label="Performance Indicator" value={s.performance_indicator || '—'} accent="purple" start={overviewInView} />
                <KpiCard icon={CalendarIcon} label="Active School Year" value={s.active_school_year || '—'} accent="green" start={overviewInView} />
                <KpiCard icon={CheckCircleIcon} label="Enrollment Status"
                  value={s.enrollment_status || '—'}
                  accent={s.enrollment_status === 'Open' ? 'green' : 'gray'}
                  start={overviewInView} />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          02. ACCESS
          ══════════════════════════════════════════════════ */}
      <section id="access" className="section dash-section dash-section-alt" ref={accessRef}>
        <div className="container">
          <SectionHeader num="02" eyebrow="Enrollment & Participation" title="Access"
            sub="Enrollment breakdown by grade level, gender distribution, and transition rates."
            inView={accessInView}
          />

          <div className={`dash-grid-2 reveal${accessInView ? ' in-view' : ''}`} style={{ transitionDelay: '0.1s' }}>
            {/* Grade-level chart */}
            <div className="dash-card">
              <div className="dash-card-header">
                <div className="dash-card-title"><CalendarIcon className="dash-card-icon" /><span>Enrollment by Grade Level</span></div>
              </div>
              {gradeChartData.length > 0 ? (
                <HBarChart data={gradeChartData} animate={accessInView}
                  keys={['sections', 'classrooms']}
                  colors={['#2E7D32', '#2E7D32']}
                  labels={['Sections', 'Classrooms']}
                />
              ) : <div className="chart-empty">No grade data available</div>}
            </div>

            {/* Gender distribution */}
            <div className="dash-card">
              <div className="dash-card-header">
                <div className="dash-card-title"><PieChartIcon className="dash-card-icon" /><span>Gender Distribution</span></div>
              </div>
              <div className="donut-center-layout">
                <DonutChart data={genderDonut} />
                <div className="donut-legend">
                  {genderDonut.map((d, i) => (
                    <div key={i} className="donut-legend-item">
                      <span className="legend-dot" style={{ background: d.color }} />
                      <span className="donut-legend-name">{d.name}</span>
                      <span className="donut-legend-val">{d.value.toLocaleString()}</span>
                    </div>
                  ))}
                  {!genderDonut.length && <p className="chart-empty">No gender data</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Rate cards */}
          <div className={`rate-cards reveal${accessInView ? ' in-view' : ''}`} style={{ transitionDelay: '0.25s' }}>
            <div className="rate-card">
              <TrendingUpIcon className="rate-icon" style={{ color: '#2E7D32' }} />
              <div className="rate-val" style={{ color: '#2E7D32' }}>{Number(s.retention_rate) > 0 ? `${Number(s.retention_rate).toFixed(1)}%` : '—'}</div>
              <div className="rate-label">Retention Rate</div>
            </div>
            <div className="rate-card">
              <ActivityIcon className="rate-icon" style={{ color: '#C83E36' }} />
              <div className="rate-val" style={{ color: '#C83E36' }}>{Number(s.dropout_rate) > 0 ? `${Number(s.dropout_rate).toFixed(1)}%` : '—'}</div>
              <div className="rate-label">Dropout Rate</div>
            </div>
            <div className="rate-card">
              <GraduationIcon className="rate-icon" style={{ color: '#F4C542' }} />
              <div className="rate-val" style={{ color: '#F4C542' }}>{Number(s.transition_completion_rate) > 0 ? `${Number(s.transition_completion_rate).toFixed(1)}%` : '—'}</div>
              <div className="rate-label">Completion Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          03. QUALITY
          ══════════════════════════════════════════════════ */}
      <section id="quality" className="section dash-section" ref={qualityRef}>
        <div className="container">
          <SectionHeader num="03" eyebrow="Academic Performance" title="Quality"
            sub="Proficiency levels across key learning areas and literacy indicators."
            inView={qualityInView}
          />

          <div className={`reveal${qualityInView ? ' in-view' : ''}`} style={{ transitionDelay: '0.1s' }}>
            <div className="quality-grid">
              <div className="dash-card quality-card-main">
                <div className="dash-card-header">
                  <div className="dash-card-title"><BarChartIcon className="dash-card-icon" /><span>Proficiency Overview</span></div>
                </div>
                <div className="quality-bars">
                  <ProgressBar label="Overall Proficiency" value={Number(s.overall_proficiency) || 0} color="#2E7D32" animate={qualityInView} />
                  <ProgressBar label="English Independent Readers" value={Number(s.english_readers) || 0} color="#2E7D32" animate={qualityInView} />
                  <ProgressBar label="Filipino Independent Readers" value={Number(s.filipino_readers) || 0} color="#F4C542" animate={qualityInView} />
                  <ProgressBar label="Math Numeracy" value={Number(s.math_numeracy) || 0} color="#F4C542" animate={qualityInView} />
                  <ProgressBar label="Science Literacy" value={Number(s.science_literacy) || 0} color="#C83E36" animate={qualityInView} />
                </div>
              </div>
              <div className="quality-gauges">
                {[
                  { label: 'Overall', value: Number(s.overall_proficiency) || 0, color: '#2E7D32' },
                  { label: 'English', value: Number(s.english_readers) || 0, color: '#2E7D32' },
                  { label: 'Math', value: Number(s.math_numeracy) || 0, color: '#F4C542' },
                ].map((g, i) => (
                  <div key={i} className="gauge-card">
                    <GaugeChart value={g.value} color={g.color} label={g.label} animate={qualityInView} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          04. EQUITY
          ══════════════════════════════════════════════════ */}
      <section id="equity" className="section dash-section dash-section-alt" ref={equityRef}>
        <div className="container">
          <SectionHeader num="04" eyebrow="Inclusive Education" title="Equity"
            sub="Data on learners with special needs, disadvantaged backgrounds, and gender parity."
            inView={equityInView}
          />

          <div className={`equity-grid reveal${equityInView ? ' in-view' : ''}`} style={{ transitionDelay: '0.1s' }}>
            <KpiCard icon={HeartIcon} label="Learners with Disabilities"
              value={Number(s.learners_with_disabilities) || 0}
              accent="blue" start={equityInView} />
            <KpiCard icon={ShieldIcon} label="Disadvantaged Learners"
              value={Number(s.disadvantaged_learners) || 0}
              accent="purple" start={equityInView} />
            <div className="dash-card equity-gender-card">
              <div className="dash-card-header">
                <div className="dash-card-title"><PieChartIcon className="dash-card-icon" /><span>Gender Parity</span></div>
              </div>
              <div className="donut-center-layout">
                <DonutChart data={genderDonut} size={120} />
                <div className="donut-legend">
                  {genderDonut.map((d, i) => (
                    <div key={i} className="donut-legend-item">
                      <span className="legend-dot" style={{ background: d.color }} />
                      <span className="donut-legend-name">{d.name}</span>
                      <span className="donut-legend-val">{d.value.toLocaleString()}</span>
                    </div>
                  ))}
                  {!genderDonut.length && <p className="chart-empty" style={{ fontSize: '0.8rem' }}>No data</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          05. WELL-BEING
          ══════════════════════════════════════════════════ */}
      <section id="wellbeing" className="section dash-section" ref={wellRef}>
        <div className="container">
          <SectionHeader num="05" eyebrow="Student Wellness" title="Well-Being"
            sub="BMI status, health assessments, and child protection case monitoring."
            inView={wellInView}
          />

          <div className={`reveal${wellInView ? ' in-view' : ''}`} style={{ transitionDelay: '0.1s' }}>
            <div className="wellbeing-grid">
              <div className="dash-card">
                <div className="dash-card-header">
                  <div className="dash-card-title"><HeartIcon className="dash-card-icon" /><span>BMI Status Distribution</span></div>
                </div>
                <div className="donut-center-layout">
                  <DonutChart data={bmiDonut} />
                  <div className="donut-legend">
                    {bmiDonut.map((d, i) => (
                      <div key={i} className="donut-legend-item">
                        <span className="legend-dot" style={{ background: d.color }} />
                        <span className="donut-legend-name">{d.name}</span>
                        <span className="donut-legend-val">{d.value.toLocaleString()}</span>
                      </div>
                    ))}
                    {!bmiDonut.length && <p className="chart-empty">No BMI data</p>}
                  </div>
                </div>
              </div>
              <div className="wellbeing-kpis">
                <div className="wb-kpi-card wb-green">
                  <HeartIcon className="wb-icon" />
                  <div className="wb-num">{Number(s.bmi_normal) || 0}</div>
                  <div className="wb-label">Normal BMI</div>
                </div>
                <div className="wb-kpi-card wb-yellow">
                  <AlertCircleIcon className="wb-icon" />
                  <div className="wb-num">{(Number(s.bmi_overweight) || 0) + (Number(s.bmi_obese) || 0)}</div>
                  <div className="wb-label">Overweight / Obese</div>
                </div>
                <div className="wb-kpi-card wb-purple">
                  <ActivityIcon className="wb-icon" />
                  <div className="wb-num">{Number(s.bmi_wasted) || 0}</div>
                  <div className="wb-label">Wasted</div>
                </div>
                <div className="wb-kpi-card wb-blue">
                  <CheckCircleIcon className="wb-icon" />
                  <div className="wb-num">{Number(s.health_assessment_done) || 0}</div>
                  <div className="wb-label">Health Assessed</div>
                </div>
                <div className="wb-kpi-card wb-red">
                  <ShieldIcon className="wb-icon" />
                  <div className="wb-num">{Number(s.child_protection_cases) || 0}</div>
                  <div className="wb-label">Child Protection Cases</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          06. HUMAN RESOURCE
          ══════════════════════════════════════════════════ */}
      <section id="hr" className="section dash-section dash-section-alt" ref={hrRef}>
        <div className="container">
          <SectionHeader num="06" eyebrow="Personnel Overview" title="Human Resource"
            sub="Teaching, non-teaching, and administrative staff distribution and vacancies."
            inView={hrInView}
          />

          <div className={`reveal${hrInView ? ' in-view' : ''}`} style={{ transitionDelay: '0.1s' }}>
            <div className="hr-grid">
              <div className="dash-card">
                <div className="dash-card-header">
                  <div className="dash-card-title"><PieChartIcon className="dash-card-icon" /><span>Personnel Mix</span></div>
                </div>
                <div className="donut-center-layout">
                  <DonutChart data={personnelDonut} />
                  <div className="donut-legend">
                    {personnelDonut.map((d, i) => (
                      <div key={i} className="donut-legend-item">
                        <span className="legend-dot" style={{ background: d.color }} />
                        <span className="donut-legend-name">{d.name}</span>
                        <span className="donut-legend-val">{d.value}</span>
                      </div>
                    ))}
                    {!personnelDonut.length && <p className="chart-empty">No personnel data</p>}
                  </div>
                </div>
              </div>
              <div className="hr-kpis">
                <div className="hr-kpi-row">
                  <UserCheckIcon className="hr-kpi-icon" style={{ color: '#2E7D32' }} />
                  <div>
                    <div className="hr-kpi-num">{Number(s.teaching_personnel) || 0}</div>
                    <div className="hr-kpi-label">Teaching Personnel</div>
                  </div>
                  <div className="hr-kpi-bar" style={{ '--fill': `${computed.totalPersonnel ? (computed.totalTeaching / computed.totalPersonnel) * 100 : 0}%`, '--color': '#2E7D32' }} />
                </div>
                <div className="hr-kpi-row">
                  <BuildingIcon className="hr-kpi-icon" style={{ color: '#2E7D32' }} />
                  <div>
                    <div className="hr-kpi-num">{Number(s.non_teaching_personnel) || 0}</div>
                    <div className="hr-kpi-label">Non-Teaching Personnel</div>
                  </div>
                  <div className="hr-kpi-bar" style={{ '--fill': `${computed.totalPersonnel ? (computed.totalNonTeaching / computed.totalPersonnel) * 100 : 0}%`, '--color': '#2E7D32' }} />
                </div>
                <div className="hr-kpi-row">
                  <ClipboardIcon className="hr-kpi-icon" style={{ color: '#F4C542' }} />
                  <div>
                    <div className="hr-kpi-num">{Number(s.administrative_staff) || 0}</div>
                    <div className="hr-kpi-label">Administrative Staff</div>
                  </div>
                  <div className="hr-kpi-bar" style={{ '--fill': `${computed.totalPersonnel ? (computed.totalAdmin / computed.totalPersonnel) * 100 : 0}%`, '--color': '#F4C542' }} />
                </div>
                <div className="hr-kpi-row hr-kpi-row-vacant">
                  <AlertCircleIcon className="hr-kpi-icon" style={{ color: '#F4C542' }} />
                  <div>
                    <div className="hr-kpi-num">{Number(s.vacant_positions) || 0}</div>
                    <div className="hr-kpi-label">Vacant Positions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          07. SCHOOL GOVERNANCE & MANAGEMENT
          ══════════════════════════════════════════════════ */}
      <section id="governance" className="section dash-section" ref={govRef}>
        <div className="container">
          <SectionHeader num="07" eyebrow="School Management" title="Governance & Infrastructure"
            sub="SBM level, performance ratings, facility ratios, and resource availability."
            inView={govInView}
          />

          <div className={`gov-grid reveal${govInView ? ' in-view' : ''}`} style={{ transitionDelay: '0.1s' }}>
            <div className="gov-kpi-card">
              <AwardIcon className="gov-kpi-icon" style={{ color: '#2E7D32' }} />
              <div className="gov-kpi-num">{s.sbm_level || '—'}</div>
              <div className="gov-kpi-label">SBM Level</div>
            </div>
            <div className="gov-kpi-card">
              <TrendingUpIcon className="gov-kpi-icon" style={{ color: '#2E7D32' }} />
              <div className="gov-kpi-num">{Number(s.opcrf_rating) > 0 ? `${Number(s.opcrf_rating).toFixed(2)}%` : '—'}</div>
              <div className="gov-kpi-label">OPCRF Rating</div>
            </div>
            <div className="gov-kpi-card">
              <SchoolIcon className="gov-kpi-icon" style={{ color: '#F4C542' }} />
              <div className="gov-kpi-num">{s.classroom_ratio || '—'}</div>
              <div className="gov-kpi-label">Classroom Ratio</div>
            </div>
            <div className="gov-kpi-card">
              <UserCheckIcon className="gov-kpi-icon" style={{ color: '#F4C542' }} />
              <div className="gov-kpi-num">{s.teacher_ratio || '—'}</div>
              <div className="gov-kpi-label">Teacher Ratio</div>
            </div>
            <div className="gov-kpi-card">
              <BookOpenIcon className="gov-kpi-icon" style={{ color: '#C83E36' }} />
              <div className="gov-kpi-num">{s.seat_ratio || '—'}</div>
              <div className="gov-kpi-label">Seat Ratio</div>
            </div>
            <div className="gov-kpi-card">
              <ZapIcon className="gov-kpi-icon" style={{ color: '#43A047' }} />
              <div className="gov-kpi-num">{s.internet_speed || '—'}</div>
              <div className="gov-kpi-label">Internet Speed</div>
            </div>
            <div className="gov-kpi-card gov-kpi-wide">
              <BuildingIcon className="gov-kpi-icon" style={{ color: '#43A047' }} />
              <div>
                <div className="gov-kpi-num">
                  {Number(s.functional_facilities_count) || 0}
                  {Number(s.total_facilities_count) > 0 && <span className="gov-kpi-of"> / {Number(s.total_facilities_count)}</span>}
                </div>
                <div className="gov-kpi-label">Functional Facilities</div>
                {Number(s.total_facilities_count) > 0 && (
                  <div className="gov-fac-bar">
                    <div className="gov-fac-fill" style={{
                      width: `${(Number(s.functional_facilities_count) / Number(s.total_facilities_count)) * 100}%`,
                    }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          08. AGENCY ACCOUNTABILITIES
          ══════════════════════════════════════════════════ */}
      <section id="accountability" className="section dash-section dash-section-alt" ref={accRef}>
        <div className="container">
          <SectionHeader num="08" eyebrow="Compliance Monitoring" title="Agency Accountabilities"
            sub="Status of transparency, accountability, and digitalization requirements."
            inView={accInView}
            aside={
              <div className="acc-summary-badge">
                <CheckCircleIcon style={{ width: 14, height: 14, color: '#2E7D32' }} />
                <span>{computed.accCompleted} / {computed.accTotal} Completed</span>
              </div>
            }
          />

          <div className={`acc-grid reveal${accInView ? ' in-view' : ''}`} style={{ transitionDelay: '0.1s' }}>
            {Object.entries(ACCOUNTABILITY_LABELS).map(([key, label]) => (
              <div key={key} className="acc-card">
                <div className="acc-card-label">{label}</div>
                <StatusBadge status={s[key] || 'Pending'} />
              </div>
            ))}
            <div className="acc-card acc-card-digitalization">
              <div className="acc-card-label">Digitalization Status</div>
              <StatusBadge status={s.digitalization_status || 'In Progress'} />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          QUICK ACCESS — directory list
          ══════════════════════════════════════════════════ */}
      <section id="access-nav" className="section quick-links-section" ref={quickRef}>
        <div className="container">
          <SectionHeader num="09" eyebrow="Explore" title="Quick Access"
            sub="Jump directly to the most visited sections of our portal."
            inView={quickInView}
          />
          <div className={`directory-list reveal${quickInView ? ' in-view' : ''}`}>
            {QUICK_LINKS.map(({ code, label, desc, path, Icon: IconC, accent }) => (
              <Link key={label} to={path} className={`directory-row accent-${accent}`}>
                <span className="directory-code">{code}</span>
                <div className="directory-body">
                  <span className="directory-label">{label}</span>
                  <span className="directory-desc">{desc}</span>
                </div>
                <div className="directory-icon-wrap"><IconC className="directory-icon" /></div>
                <ArrowRightIcon className="directory-arrow" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          PROGRAMS & ACTIVITIES
          ══════════════════════════════════════════════════ */}
      {ppas.length > 0 && (
        <section className="section ppas-section" ref={ppaRef}>
          <div className="container">
            <div className={`sec-label reveal${ppaInView ? ' in-view' : ''}`}>
              <span className="sec-label-num">10</span>
              <div className="sec-label-text">
                <span className="sec-label-eyebrow">Programs & Activities</span>
                <h2 className="sec-label-title">Latest PPAs</h2>
                <p className="sec-label-sub">Recent programs, projects, and activities.</p>
              </div>
              <div className="sec-label-aside">
                <Link to="/ppas" className="view-all-link"><span>View All</span><ArrowRightIcon className="view-all-icon" /></Link>
              </div>
            </div>
            <div className={`feature-grid reveal${ppaInView ? ' in-view' : ''}`} style={{ transitionDelay: '0.15s' }}>
              {ppas.map((p, i) => (
                <Link key={p.id} to="/ppas" className={`ppa-card${i === 0 ? ' ppa-card-feature' : ''}`}>
                  {p.image_url && (
                    <div className="ppa-image-wrap">
                      <img src={getImageUrl(p.image_url)} alt={p.name} className="ppa-image" onError={e => { e.target.parentNode.style.display = 'none'; }} />
                      <div className="ppa-image-overlay" />
                      {p.frequency && <span className="ppa-image-tag">{p.frequency}</span>}
                    </div>
                  )}
                  <div className="ppa-body">
                    <p className="ppa-name">{p.name}</p>
                    {p.short_description && <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: 1.6 }}>{p.short_description}</p>}
                    <span className="ppa-link">Learn more <ArrowRightIcon className="ppa-link-icon" /></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
