import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "DELETE") {
    return res.status(405).end();
  }

  const token = req.cookies["nbviz.token"];

  if (!token) {
    return res.status(401).json({ message: "Not authenticated." });
  }

  const response = await fetch(`${process.env.INTERNAL_API_URL}/users/delete`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return res.status(response.status).json(data);
  }

  res.setHeader(
    "Set-Cookie",
    "nbviz.token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0",
  );

  return res.status(200).json(data);
}
