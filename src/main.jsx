import React, { useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const pageModules = import.meta.glob("../legacy-pages/**/*.html", {
  query: "?raw",
  import: "default",
  eager: true,
});

function moduleForPath(pathname) {
  const clean = pathname.replace(/\/+$/, "") || "/";
  const candidates = clean === "/"
    ? ["../legacy-pages/home.html"]
    : [
        `../legacy-pages${clean}/index.html`,
        `../legacy-pages${clean}.html`,
      ];
  return candidates.map((key) => pageModules[key]).find(Boolean) || pageModules["../legacy-pages/404.html"];
}

function parsePage(source) {
  const body = source.match(/<body(?:\s+class="([^"]*)")?[^>]*>([\s\S]*?)<\/body>/i);
  const title = source.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  const description = source.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1];
  return {
    bodyClass: body?.[1] || "",
    html: (body?.[2] || source).replace(/<script[^>]*src="\/app\.js"[^>]*><\/script>/gi, ""),
    title,
    description,
  };
}

function LegacyPage() {
  const page = useMemo(() => parsePage(moduleForPath(window.location.pathname)), []);

  useEffect(() => {
    document.body.className = page.bodyClass;
    if (page.title) document.title = page.title;
    let description = document.querySelector('meta[name="description"]');
    if (!description) {
      description = document.createElement("meta");
      description.name = "description";
      document.head.append(description);
    }
    if (page.description) description.content = page.description;

    const script = document.createElement("script");
    script.type = "module";
    script.src = "/app.js";
    document.body.append(script);
    return () => script.remove();
  }, [page]);

  return <div dangerouslySetInnerHTML={{ __html: page.html }} />;
}

createRoot(document.getElementById("root")).render(<LegacyPage />);
