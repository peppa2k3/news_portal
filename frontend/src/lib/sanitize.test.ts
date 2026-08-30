import { describe, expect, it } from "vitest";
import { sanitizeArticleHtml } from "./sanitize";

describe("sanitizeArticleHtml", () => {
  it("removes executable markup", () => {
    const result = sanitizeArticleHtml('<p onclick="alert(1)">Tin</p><script>alert(1)</script>');
    expect(result).toBe("<p>Tin</p>");
  });

  it("keeps safe editorial markup and secures links", () => {
    const result = sanitizeArticleHtml('<h2>Tiêu đề</h2><a href="https://example.com">Nguồn</a>');
    expect(result).toContain("<h2>Tiêu đề</h2>");
    expect(result).toContain('rel="noopener noreferrer"');
  });
});
