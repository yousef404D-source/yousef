/**
 * Turns a complete generated HTML document into a data: URL so it can be
 * dropped straight into an <iframe src="..."> for an instant live preview —
 * no server storage, no extra route, no upload step.
 */
export function toPreviewUrl(html: string): string {
  const base64 =
    typeof window === "undefined"
      ? Buffer.from(html, "utf-8").toString("base64")
      : btoa(unescape(encodeURIComponent(html)));
  return `data:text/html;base64,${base64}`;
}
