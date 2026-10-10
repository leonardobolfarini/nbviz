import { type NextRequest, NextResponse } from "next/server";

export default function proxy(request: NextRequest) {
  if (!request.cookies.has("nbviz.token")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/perfil/:path*"],
};
