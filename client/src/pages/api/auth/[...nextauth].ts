import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import * as jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  jwt: {
    // JUST ENCODE AND DECODE FOR EACH EXTERNAL REQUEST or SEND THE DECODED TOKEN
    // encode: async ({ secret, token, maxAge }) => {
    //   console.log("encode", token);
    //   const encodedToken = jwt.sign(token, process.env.NEXTAUTH_SECRET, {
    //     algorithm: "HS256",
    //   });
    //   return encodedToken;
    // },
    // decode: async ({ secret, token, maxAge }) => {
    //   console.log("decode", token);
    //   const decodedToken = jwt.verify(token, process.env.NEXTAUTH_SECRET, {
    //     algorithms: ["HS256"],
    //   });
    //   return decodedToken;
    // },
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    // async jwt({ token, account, profile, user }) {
    //   // Persist the OAuth access_token and or the user id to the token right after signin
    //   if (account) {
    //     token.accessToken = account.access_token;
    //     token.id = user?.id;
    //   }
    //   return Promise.resolve(token);
    // },
    // async session({ session, token, user }) {
    //   // Send properties to the client, like an access_token and user id from a provider.
    //   const encodedToken = jwt.sign(token, process.env.NEXTAUTH_SECRET, {
    //     algorithm: "HS256",
    //   });
    //   session.accessToken = token.accessToken;
    //   session.id = token.id;
    //   session.token = encodedToken;
    //   return Promise.resolve(session);
    // },
  },
});
