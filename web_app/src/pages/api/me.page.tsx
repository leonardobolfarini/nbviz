import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const token = req.cookies["nbviz.token"];

  if (!token) {
    return res.status(401).json({ message: "Not authenticated." });
  }

  const response = await fetch(`${process.env.INTERNAL_API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  return res.status(response.status).json(data);
}
