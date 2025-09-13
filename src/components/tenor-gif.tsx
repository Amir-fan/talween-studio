'use client';

import React, { useEffect } from 'react';

export function TenorGIF() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://tenor.com/embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Check if the script is still in the body before trying to remove it
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="tenor-gif-embed" data-postid="14621922" data-share-method="host" data-aspect-ratio="1.25" data-width="100%">
        <a href="https://tenor.com/view/schoology-book-loading-pencil-writing-gif-14621922">Schoology Book GIF</a>
        from <a href="https://tenor.com/search/schoology-gifs">Schoology GIFs</a>
    </div>
  );
}
