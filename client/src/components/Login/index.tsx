import React from "react";
import * as Form from "@radix-ui/react-form";
import * as Separator from "@radix-ui/react-separator";
import { FaGithub } from "react-icons/fa";
import { useSession, signIn, signOut } from "next-auth/react";

const Login = () => {
  const link = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo&redirect_uri=${process.env.HOMEPAGE}/login/callback`;
  return (
    <Form.Root className="w-[450px] bg-white p-10 text-slate-500 rounded-lg flex flex-col items-center">
      <h2 className="text-2xl font-semibold text-slate-700 mb-5">
        Log in or Sign up
      </h2>
      <button
        onClick={() => signIn("github")}
        className="transition-all flex items-center justify-center mb-5 h-10 border font-semibold text-white bg-slate-700 border-slate-300 rounded w-full hover:bg-slate-600"
      >
        <FaGithub className="text-white text-lg mr-5" />
        Continue with GitHub
      </button>
      <div className="w-full flex items-center text-sm font-semibold text-slate-400">
        <Separator.Root className="bg-slate-300 mr-2 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px my-[15px]" />
        or
        <Separator.Root className="bg-slate-300 ml-2 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px my-[15px]" />
      </div>
      <div className="w-full">
        <Form.Field className="grid mb-[10px]" name="email">
          <div className="flex items-baseline justify-between">
            <Form.Label className="text-[13px] font-bold leading-[35px] ">
              Email
            </Form.Label>
            <Form.Message
              className="text-[13px] opacity-[0.8]"
              match="valueMissing"
            >
              Please enter your email
            </Form.Message>
            <Form.Message
              className="text-[13px] opacity-[0.8]"
              match="typeMismatch"
            >
              Please provide a valid email
            </Form.Message>
          </div>
          <Form.Control asChild>
            <input
              className="transition-all box-border border border-slate-300 w-full inline-flex h-[35px] appearance-none items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none outline-none hover:border-slate-600 focus:border-slate-600"
              type="email"
              required
            />
          </Form.Control>
        </Form.Field>
      </div>

      <Form.Submit asChild>
        <button className="transition-all box-border w-full inline-flex h-10 items-center justify-center rounded bg-blue-700 text-white px-[15px] hover:bg-blue-600 font-medium leading-none focus:outline-none mt-5">
          Continue
        </button>
      </Form.Submit>
    </Form.Root>
  );
};

export default Login;
