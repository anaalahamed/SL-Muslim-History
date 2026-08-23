import Script from 'next/script'

// Powers the Tamil ↔ English toggle in the Header (LanguageToggle.tsx).
// Google's official free "Website Translator" widget was retired in 2019,
// but the underlying translate element it was built on
// (translate.google.com/translate_a/element.js) is still live and is what
// most "add Google Translate to my site" guides use today — it's free, has
// no per-character billing, and needs no backend, which matters since the
// whole site's Tamil content (hundreds of articles, growing) would be
// expensive and slow to translate any other way. Quality is automatic
// machine translation, not human-reviewed — good enough for a visitor to
// follow along, not publishable English content in its own right.
//
// This component only loads the engine and gives it a place to mount
// (hidden — LanguageToggle renders the real button). The actual
// switching is done by LanguageToggle setting the `googtrans` cookie
// Google's script reads on load.
export default function GoogleTranslate() {
  return (
    <>
      {/* Google's translated text stays live-updated on every page the
          visitor navigates to next (it watches the whole page for new
          content), which is what makes "pick English once, stay in
          English everywhere" work without re-clicking the button. The
          trade-off: it edits the DOM directly, outside React's control,
          and React can throw ("Failed to execute 'removeChild'/
          'insertBefore' on 'Node'") if it later tries to update a node
          Google has already restructured — a well-known conflict between
          Google Translate and any React-based site. This patch makes
          those two specific DOM calls a safe no-op instead of a crash,
          without changing their behavior for every other, normal case.
          Runs before hydration so it's in place from the first paint. */}
      <Script id="google-translate-dom-guard" strategy="beforeInteractive">
        {`
          (function () {
            if (typeof Node === 'undefined' || !Node.prototype) return;
            var origRemoveChild = Node.prototype.removeChild;
            Node.prototype.removeChild = function (child) {
              if (child.parentNode !== this) return child;
              return origRemoveChild.apply(this, arguments);
            };
            var origInsertBefore = Node.prototype.insertBefore;
            Node.prototype.insertBefore = function (newNode, refNode) {
              if (refNode && refNode.parentNode !== this) return newNode;
              return origInsertBefore.apply(this, arguments);
            };
          })();
        `}
      </Script>
      <div id="google_translate_element" style={{ display: 'none' }} />
      <Script id="google-translate-init" strategy="afterInteractive">
        {`
          function googleTranslateElementInit() {
            new window.google.translate.TranslateElement(
              { pageLanguage: 'ta', includedLanguages: 'en', autoDisplay: false },
              'google_translate_element'
            );
          }
        `}
      </Script>
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
    </>
  )
}
