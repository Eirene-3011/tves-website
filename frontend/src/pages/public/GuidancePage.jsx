import React, { useEffect, useMemo, useState } from 'react';
import api from '../../utils/api';
import './GuidancePage.css';

const fallback = `
  <p><strong>Coming soon.</strong> TVES guidance, counselling, referral, and student-support information will be published here after official confirmation.</p>
`;

const serviceCards = [
  {
    icon: '◌',
    title: 'Guidance & counselling',
    text: 'A safe, respectful space for learners to ask questions, reflect, and seek help.'
  },
  {
    icon: '↗',
    title: 'Referral support',
    text: 'Helping families connect with the right school and community support when needed.'
  },
  {
    icon: '♡',
    title: 'Learner wellbeing',
    text: 'Promoting belonging, protection, confidence, and readiness to learn.'
  }
];

export default function GuidancePage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    api.get('/content/guidance')
      .then(({ data }) => {
        if (!mounted) return;
        setContent(
          data?.find((block) => block.section_key === 'student_services') ||
          data?.[0] ||
          null
        );
      })
      .catch(() => {
        if (mounted) setContent(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const body = useMemo(
    () => content?.body_richtext || fallback,
    [content]
  );

  return (
    <main className="guidance-page">
      <section className="guidance-hero" aria-labelledby="guidance-page-title">
        <div className="guidance-container guidance-hero__inner">
          <div className="guidance-hero__copy">
            <p className="guidance-kicker">
              <span className="guidance-kicker__mark" aria-hidden="true">+</span>
              Student support
            </p>
            <h1 id="guidance-page-title">
              Guidance, counselling <em>&amp; student services</em>
            </h1>
            <p className="guidance-hero__intro">
              Care, clarity, and responsive support for every TVES learner and family.
            </p>
          </div>

          <div className="guidance-hero__badge" aria-label="Support for every learner">
            <span className="guidance-hero__badge-icon" aria-hidden="true">✦</span>
            <span>Support for  
<strong>every learner</strong></span>
          </div>
        </div>
      </section>

      <section className="guidance-section">
        <div className="guidance-container">
          <div className="guidance-intro">
            <div>
              <p className="guidance-overline">A caring school community</p>
              <h2>Here when learners need us.</h2>
            </div>
            <p>
              Helping learners and families navigate school life through care, guidance,
              referral, and responsive support.
            </p>
          </div>

          <div className="guidance-service-grid" aria-label="Student support services">
            {serviceCards.map((service) => (
              <article className="guidance-service-card" key={service.title}>
                <span className="guidance-service-card__icon" aria-hidden="true">{service.icon}</span>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </article>
            ))}
          </div>

          <article className="guidance-content-card">
            <div className="guidance-content-card__topline">
              <span className="guidance-pill">Student services</span>
              <span className="guidance-content-card__status">
                <span className="guidance-status-dot" aria-hidden="true" />
                {loading ? 'Loading information' : 'Official school information'}
              </span>
            </div>

            <div className="guidance-content-card__heading">
              <div className="guidance-content-card__compass" aria-hidden="true">✧</div>
              <div>
                <h2>{content?.title || 'Guidance & student services'}</h2>
                <p>Information for learners, families, and the wider TVES community.</p>
              </div>
            </div>

            <div className="guidance-content-card__rule" />

            <div className="guidance-rich-content" dangerouslySetInnerHTML={{ __html: body }} />
          </article>
        </div>
      </section>
    </main>
  );
}
