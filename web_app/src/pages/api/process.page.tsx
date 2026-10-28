import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const token = req.cookies["nbviz.token"];

  if (!token) {
    return res.status(401).json({ message: "Not authenticated." });
  }

  const contentType = req.headers["content-type"];
  const contentLength = req.headers["content-length"];

  const response = await fetch(`${process.env.INTERNAL_API_URL}/process`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(contentType ? { "Content-Type": contentType } : {}),
      ...(contentLength ? { "Content-Length": contentLength } : {}),
    },
    body: req as unknown as BodyInit,
    duplex: "half",
  } as RequestInit & { duplex: "half" });

  const data = await response.json().catch(() => null);

  return res.status(response.status).json(data);
}
