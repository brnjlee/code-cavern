import React from "react";
import * as Form from "@radix-ui/react-form";
import * as Separator from "@radix-ui/react-separator";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { useSession, signIn, signOut } from "next-auth/react";

const Login = () => {
  const { data: session, status } = useSession();
  console.log(`${process.env.NEXT_PUBLIC_BASE_URL}/space/1`);
  return (
    <div className="w-[450px] p-5 text-slate-500 rounded-lg flex flex-col items-center">
      <h2 className="text-3xl font-bold text-slate-800 mb-10">Welcome back</h2>
      <button
        onClick={() =>
          signIn("github", {
            callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/space/1`,
          })
        }
        className="transition-all flex items-center justify-center mb-5 h-10 border font-semibold text-slate-800 bg-white border-slate-300 rounded w-full hover:bg-slate-200"
      >
        <FaGithub className="text-xl mr-5" />
        Continue with GitHub
      </button>
      <button
        onClick={() =>
          signIn("google", {
            callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/space/1`,
          })
        }
        className="transition-all flex items-center justify-center mb-5 h-10 border font-semibold text-slate-800 bg-white border-slate-300 rounded w-full hover:bg-slate-200"
      >
        <FaGoogle className="text-xl mr-5" />
        Continue with Google
      </button>
    </div>
  );
};

export default Login;
