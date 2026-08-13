import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function GuidancePage() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    api.get('/content/guidance')
      .then(({ data }) => setContent(data?.find(block => block.section_key === 'student_services') || data?.[0] || null))
      .catch(() => { });
  }, []);

  const fallback = '<p><strong>Coming soon.</strong> TVES guidance, counselling, referral, and student-support information will be published here after official confirmation.</p>';

  return (
    <div className="guidance-page">
      <div className="page-header">
        <div className="container">
          <h1>Guidance, Counselling &amp; Student Services</h1>
          <p>Support services for TVES learners and families</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Support for every learner</h2>
          <p className="section-subtitle">
            Helping learners and families navigate school life through care, guidance, referral, and responsive support.
          </p>

          <div className="grid-auto">
            <article className="card card-body">
              <h2 className="section-title">{content?.title || 'Student Services'}</h2>
              <div
                className="rich-content"
                dangerouslySetInnerHTML={{ __html: content?.body_richtext || fallback }}
              />
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
