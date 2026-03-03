import { describe, it, expect } from "vitest";
import React from "react";
import ReactDOMServer from "react-dom/server";
import ContactPage from "@/app/contact/page";

describe("Contact page", () => {
  it("renders form inputs", () => {
    const html = ReactDOMServer.renderToStaticMarkup(<ContactPage />);
    expect(html).toContain('name="name"');
    expect(html).toContain('name="email"');
    expect(html).toContain('name="message"');
  });
});
