import type { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

const REQUEST_HEADERS = ["accept", "content-type", "content-length"];
const RESPONSE_HEADERS = [
  "cache-control",
  "content-disposition",
  "content-length",
  "content-type",
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const internalApiUrl = process.env.INTERNAL_API_URL;
  const path = req.query.path;

  if (!internalApiUrl || !Array.isArray(path) || path.length === 0) {
    return res.status(500).json({ message: "Internal API URL is not configured." });
  }

  const upstreamUrl = new URL(
    path.map(encodeURIComponent).join("/"),
    `${internalApiUrl.replace(/\/+$/, "")}/`,
  );

  for (const [key, value] of Object.entries(req.query)) {
    if (key !== "path") {
      for (const item of Array.isArray(value) ? value : [value]) {
        if (typeof item === "string") {
          upstreamUrl.searchParams.append(key, item);
        }
      }
    }
  }

  const headers = new Headers();
  for (const header of REQUEST_HEADERS) {
    const value = req.headers[header];
    if (typeof value === "string") headers.set(header, value);
  }

  const method = req.method ?? "GET";
  const response = await fetch(upstreamUrl, {
    method,
    headers,
    body:
      method === "GET" || method === "HEAD"
        ? undefined
        : (req as unknown as BodyInit),
    duplex: "half",
  } as RequestInit & { duplex: "half" });

  for (const header of RESPONSE_HEADERS) {
    const value = response.headers.get(header);
    if (value) res.setHeader(header, value);
  }

  res.status(response.status);
  if (!response.body) return res.end();

  try {
    await pipeline(Readable.fromWeb(response.body as never), res);
  } catch (error) {
    console.error("Failed to stream API proxy response", error);
    if (!res.headersSent) {
      return res.status(502).json({ message: "Unable to stream API response." });
    }
  }
}
