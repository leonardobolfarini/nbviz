import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "PATCH") return res.status(405).end();

  const token = req.cookies["nbviz.token"];
  if (!token) return res.status(401).json({ message: "Not authenticated." });

  if (
    typeof req.body?.openalex_key !== "string" ||
    !req.body.openalex_key.trim()
  ) {
    return res.status(400).json({ message: "Key is required." });
  }

  try {
    const response = await fetch(
      `${process.env.INTERNAL_API_URL}/users/openalex/update`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ openalex_key: req.body.openalex_key }),
      },
    );
    const data = await response.json().catch(() => null);
    return res.status(response.status).json(data);
  } catch {
    return res.status(502).json({ message: "Unable to reach the API." });
  }
}
