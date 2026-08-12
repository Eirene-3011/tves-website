import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSchoolInfo } from '../../hooks/useSchoolInfo';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';
import './Header.css';

const ChevronDownIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ArrowRightIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const SparkleIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z" />
  </svg>
);

const MenuIcon = ({ open }) => (
  <span className={`menu-icon${open ? ' is-open' : ''}`} aria-hidden="true">
    <span />
    <span />
    <span />
  </span>
);

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/about', children: [
    { label: 'School Profile', path: '/about' },
    { label: 'Organizational Structure', path: '/about/organizational-structure' },
    { label: "Citizen's Charter", path: '/about/citizens-charter' },
    { label: 'Committees & Councils', path: '/about/committees' },
  ] },
  { label: 'Admissions', path: '/admissions', children: [
    { label: 'Enrollment Info', path: '/admissions' },
    { label: 'Enrollment Statistics', path: '/admissions/enrollment-statistics' },
  ] },
  { label: 'Careers', path: '/careers' },
  { label: 'Student Services', path: '/guidance' },
  { label: 'News & Updates', path: '/news' },
  { label: 'PPAs', path: '/ppas' },
  { label: "Students' Corner", path: '/students-corner' },
  { label: 'Accomplishments', path: '/accomplishments' },
  { label: 'Alumni', path: '/alumni' },
  { label: 'Learning Resources', path: '/learning-resources' },
  { label: 'Issuances', path: '/issuances', children: [
    { label: 'DepEd Orders', path: '/issuances?type=deped_order' },
    { label: 'Procurement Postings', path: '/issuances?type=procurement' },
    { label: 'School Memos', path: '/issuances?type=memo' },
    { label: 'External Links', path: '/issuances#external' },
  ] },
  { label: 'Calendar', path: '/school-calendar' },
  { label: 'Contact Us', path: '/contact', children: [
    { label: 'Contact & Feedback', path: '/contact' },
    { label: 'FAQ', path: '/faq' },
  ] },
];

function NavItem({ item, isActivePath, isOpen, onToggle, onNavigate }) {
  const hasChildren = Boolean(item.children);

  return (
    <div className={`nav-item${hasChildren ? ' has-children' : ''}${isOpen ? ' is-open' : ''}`}>
      {hasChildren ? (
        <button type="button" className={`nav-link nav-trigger${isActivePath ? ' is-active' : ''}`} onClick={() => onToggle(item.label)} aria-haspopup="true" aria-expanded={isOpen}>
          <span>{item.label}</span>
          <ChevronDownIcon className={`nav-caret${isOpen ? ' is-flipped' : ''}`} />
        </button>
      ) : (
        <Link to={item.path} className={`nav-link${isActivePath ? ' is-active' : ''}`} onClick={onNavigate}>
          <span>{item.label}</span>
        </Link>
      )}

      {hasChildren && (
        <div className={`nav-dropdown${isOpen ? ' is-open' : ''}`}>
          <div className="dropdown-panel">
            <div className="dropdown-heading"><span>{item.label}</span><span /></div>
            {item.children.map((child) => (
              <Link key={child.label} to={child.path} className="dropdown-item" onClick={onNavigate}>
                <span>{child.label}</span>
                <ArrowRightIcon className="dropdown-arrow" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { info } = useSchoolInfo();
  const location = useLocation();
  const navRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openSection, setOpenSection] = useState(null);
  const [banner, setBanner] = useState(null);
  const [bannerLoading, setBannerLoading] = useState(true);

  useEffect(() => {
    api.get('/banners')
      .then((response) => {
        const data = response.data || [];
        setBanner(data.find((item) => item.type === 'general') || null);
      })
      .catch((error) => console.error('Banner fetch failed:', error))
      .finally(() => setBannerLoading(false));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setOpenSection(null);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) setOpenSection(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setOpenSection(null);
  }, []);

  const schoolName = info?.school_name || 'Tropical Village Elementary School';
  const motto = info?.motto || 'Teach with heart, Value each child, Excel together, Serve with pride';

  return (
    <>
      <header className={`site-header${scrolled ? ' has-scrolled' : ''}`}>
        <div className="utility-bar">
          <div className="header-container utility-inner">
            <span className="utility-kicker"><span className="status-dot" /> Welcome to our school community</span>
            <div className="utility-meta"><span>Public Elementary School</span><span className="utility-divider" /><span className="recognition"><span className="recognition-mark" /> DepEd Recognized</span></div>
          </div>
        </div>

        <section className="masthead" aria-label="School identity">
          <div className="masthead-backdrop" aria-hidden="true">
            {bannerLoading ? <div className="masthead-skeleton" /> : banner ? (
              <img src={getImageUrl(banner.image_url)} alt="" className="masthead-img" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
            ) : <div className="masthead-fallback" />}
            <div className="masthead-overlay" />
          </div>
          <div className="header-container masthead-layout">
            <div className="identity-block">
              <div className="logo-frame">
                {info?.logo_url && <img src={getImageUrl(info.logo_url)} alt="School Logo" className="masthead-logo" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}
              </div>
              <div className="identity-copy">
                {banner?.title && <span className="announcement-label"><SparkleIcon /> {banner.title}</span>}
                <p className="identity-eyebrow">A place to learn, grow, and belong</p>
                <h1>{schoolName}</h1>
                <p className="identity-motto">{motto}</p>
              </div>
            </div>
            <div className="masthead-side" aria-hidden="true">
              <span className="side-label">Our shared promise</span>
              <div className="identity-accent"><span /><span /><span /></div>
            </div>
          </div>
        </section>

        <nav className={`nav-bar${scrolled ? ' is-sticky' : ''}`} ref={navRef} aria-label="Main navigation">
          <div className="header-container nav-inner">
            <div className="nav-mobile-title"><span className="nav-mobile-line" /> Explore the school</div>
            <div className={`nav-main${menuOpen ? ' is-mobile-open' : ''}`}>
            <div className="nav-links">
              <div className="nav-drawer-brand">
                {info?.logo_url && <img src={getImageUrl(info.logo_url)} alt="" className="nav-drawer-logo" />}
                <span>{schoolName}</span>
              </div>
              {NAV_ITEMS.map((item) => (
                <NavItem key={item.label} item={item} isActivePath={location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)} isOpen={openSection === item.label} onToggle={(label) => setOpenSection((current) => current === label ? null : label)} onNavigate={closeMenu} />
              ))}
            </div>
            </div>
            <button type="button" className={`menu-button${menuOpen ? ' is-active' : ''}`} onClick={() => setMenuOpen((current) => !current)} aria-label="Toggle navigation menu" aria-expanded={menuOpen}>
              <MenuIcon open={menuOpen} /><span className="menu-button-text">Menu</span>
            </button>
          </div>
        </nav>
      </header>
      {menuOpen && <button type="button" className="mobile-backdrop" aria-label="Close navigation menu" onClick={closeMenu} />}
    </>
  );
}

