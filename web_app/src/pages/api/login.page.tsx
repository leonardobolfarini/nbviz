import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const response = await fetch(`${process.env.INTERNAL_API_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body),
  });

  const data = await response.json();

  if (!response.ok) {
    return res.status(response.status).json(data);
  }

  res.setHeader(
    "Set-Cookie",
    [
      `nbviz.token=${encodeURIComponent(data.access_token)}`,
      "HttpOnly",
      process.env.NODE_ENV === "production" ? "Secure" : "",
      "SameSite=lax",
      "path=/",
      "MaxAge=86400",
    ]
      .filter(Boolean)
      .join("; "),
  );

  return res.status(200).json({
    success: true,
  });
}
