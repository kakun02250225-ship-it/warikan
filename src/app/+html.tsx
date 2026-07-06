import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

const BASE = '/warikan';

/** Web書き出し時のHTMLシェル。PWA用のmanifest・アイコン・SW登録をここに入れる。 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <title>貸し借り家計簿</title>
        <meta name="theme-color" content="#3B82F6" />
        <link rel="manifest" href={`${BASE}/manifest.json`} />
        <link rel="apple-touch-icon" href={`${BASE}/icons/icon-180.png`} />
        {/* iOSでホーム画面追加したときにアプリとして全画面起動させる */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="貸し借り家計簿" />
        <ScrollViewStyleReset />
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('${BASE}/sw.js'); }); }`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
