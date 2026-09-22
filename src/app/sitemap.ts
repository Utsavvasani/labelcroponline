import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.labelcroponline.com";
  const now = new Date();

  return [
    {
      url: base,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${base}/meesho-label-crop`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${base}/flipkart-label-crop`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${base}/merge-pdf`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${base}/split-pdf`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${base}/compress-pdf`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${base}/rotate-pdf`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.80,
    },
    {
      url: `${base}/pdf-to-images`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.80,
    },
    {
      url: `${base}/custom-crop`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${base}/rating-card`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.70,
    },
    {
      url: `${base}/about-us`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.50,
    },
    {
      url: `${base}/contact-us`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.50,
    },
    {
      url: `${base}/privacy-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.30,
    },
    {
      url: `${base}/terms-and-conditions`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.30,
    },
  ];
}
