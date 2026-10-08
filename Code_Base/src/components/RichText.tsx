/* Renders studio copy with **bold** marks and line breaks, without innerHTML. */
import { Fragment } from 'react';

export function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, li) => (
        <Fragment key={li}>
          {li > 0 && <br />}
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={i}>{part.slice(2, -2)}</strong>
              : <Fragment key={i}>{part}</Fragment>)}
        </Fragment>
      ))}
    </>
  );
}
