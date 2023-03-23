import withAuth from "next-auth/middleware";
import { authOptions } from "./pages/api/auth/[...nextauth]";

export default withAuth({
  jwt: { decode: authOptions.jwt?.decode },
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = { matcher: ["/space"] };
