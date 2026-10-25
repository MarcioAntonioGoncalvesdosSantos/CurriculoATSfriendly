import type { RewriteResult } from '../lib/types';

export function CvDocument({ result }: { result: RewriteResult }) {
  const [name, ...contact] = result.contact;

  return (
    <div className="cv-body">
      {name ? <h1>{name.toUpperCase()}</h1> : null}
      {contact.length ? <p>{contact.join(' · ')}</p> : null}
      {result.sections.map((section) => (
        <section key={section.id}>
          <h2>{section.title}</h2>
          <ul>
            {section.lines.map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
