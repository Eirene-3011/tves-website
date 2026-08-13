import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function GuidancePage() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    api.get('/content/guidance')
      .then(({ data }) => {
        setContent(
          data?.find((block) => block.section_key === 'student_services') ||
          data?.[0] ||
          null
        );
      })
      .catch(() => {});
  }, []);

  const fallback = `
    <p><strong>Coming soon.</strong> TVES guidance, counselling, referral,
    and student-support information will be published here after official confirmation.</p>
  `;

  return (
    <main className="guidance-page">
      <header className="page-header guidance-hero">
        <div className="container">
          <p className="section-eyebrow">Student Services</p>
          <h1>Guidance, Counselling &amp; Student Services</h1>
          <p className="guidance-hero__subtitle">
            Support services for TVES learners and families
          </p>
        </div>
      </header>

      <section className="section guidance-section">
        <div className="container">
          <div className="guidance-intro">
            <h2 className="section-title">Support for every learner</h2>
            <p className="section-subtitle">
              Helping learners and families navigate school life through care,
              guidance, referral, and responsive support.
            </p>
          </div>

          <article className="card card-body guidance-card">
            <div className="guidance-card__heading">
              <span className="section-eyebrow">Student services</span>
              <h2>{content?.title || 'Student Services'}</h2>
            </div>

            <div
              className="rich-content guidance-content"
              dangerouslySetInnerHTML={{
                __html: content?.body_richtext || fallback,
              }}
            />
          </article>
        </div>
      </section>
    </main>
  );
}
