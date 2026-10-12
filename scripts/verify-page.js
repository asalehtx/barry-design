// Paste into the browser console (or the browser pane's JavaScript tool) on any page of the
// production preview. Defines window.verifyPage(), which resolves to a report for the current
// page: every array should be empty, and overflow and placeholder should be false.
window.verifyPage = async () => {
  // Reveal scroll-animated content so it is measured in its final state.
  document.querySelectorAll('.reveal-fade-up').forEach((el) => el.classList.add('visible'));
  await new Promise((r) => setTimeout(r, 900));

  const visible = (el) => {
    const cs = getComputedStyle(el);
    const box = el.getBoundingClientRect();
    return cs.display !== 'none' && cs.visibility !== 'hidden' && box.width > 0 && box.height > 0;
  };

  const smallText = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const el = node.parentElement;
    if (!node.textContent.trim() || !el || !visible(el)) continue;
    const size = parseFloat(getComputedStyle(el).fontSize);
    if (size < 12) smallText.push(`${el.tagName.toLowerCase()}.${el.className} "${node.textContent.trim().slice(0, 30)}" ${size}px`);
  }

  const urls = new Set();
  document.querySelectorAll('img').forEach((img) => urls.add(img.currentSrc || img.src));
  document.querySelectorAll('*').forEach((el) => {
    const m = getComputedStyle(el).backgroundImage.match(/url\("([^"]+)"\)/);
    if (m && !m[1].startsWith('data:')) urls.add(m[1]);
  });
  const brokenImages = [];
  for (const url of urls) {
    const res = await fetch(url);
    if (!res.ok || !(res.headers.get('content-type') || '').startsWith('image/')) brokenImages.push(`${url} ${res.status}`);
  }

  const smallTargets = [...document.querySelectorAll('button, select, input, textarea, .bd-filter-btn, .bd-carousel-dot')]
    .filter(visible)
    .filter((el) => {
      const r = el.getBoundingClientRect();
      return innerWidth <= 1024 && (r.height < 44 || r.width < 44);
    })
    .map((el) => `${el.tagName.toLowerCase()}.${el.className} ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`);

  return {
    path: location.pathname,
    width: innerWidth,
    overflow: document.documentElement.scrollWidth > innerWidth,
    smallText,
    brokenImages,
    smallTargets,
    placeholder: document.body.innerHTML.includes('photos-coming-soon'),
  };
};
