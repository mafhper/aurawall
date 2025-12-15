import React from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { Writable } from 'node:stream';
import App from './App';

export function render(url: string) {
  const helmetContext: { helmet?: any } = {};
  
  return new Promise<{ html: string; helmet: any }>((resolve, reject) => {
    let html = '';
    const stream = new Writable({
      write(chunk, _encoding, cb) {
        html += chunk.toString();
        cb();
      }
    });

    const { pipe } = renderToPipeableStream(
      <React.StrictMode>
        <HelmetProvider context={helmetContext}>
          <StaticRouter location={url} basename={import.meta.env.BASE_URL}>
            <App />
          </StaticRouter>
        </HelmetProvider>
      </React.StrictMode>,
      {
        onAllReady() {
          pipe(stream);
        },
        onError(error) {
          reject(error);
        }
      }
    );
    
    stream.on('finish', () => {
      resolve({ html, helmet: helmetContext.helmet });
    });
  });
}
