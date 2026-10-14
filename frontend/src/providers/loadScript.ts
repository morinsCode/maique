// One promise per script URL, shared by every caller, so each provider's API
// script is added to the page at most once no matter how often players mount.
const loadedScripts = new Map<string, Promise<void>>();

export function loadScriptOnce(src: string): Promise<void> {
  const existing = loadedScripts.get(src);
  if (existing) return existing;

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => {
      // Forget the failed attempt so a later call can retry.
      loadedScripts.delete(src);
      script.remove();
      reject(new Error(`Failed to load script: ${src}`));
    };
    document.body.appendChild(script);
  });

  loadedScripts.set(src, promise);
  return promise;
}
