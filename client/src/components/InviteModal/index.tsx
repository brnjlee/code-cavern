import React, { useEffect, useRef } from "react";
import * as Form from "@radix-ui/react-form";
import { useRouter } from "next/router";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { fetcher, poster } from "@/requests";
import clsx from "clsx";
import * as Separator from "@radix-ui/react-separator";
import Member from "../Member";
type InviteModal = {
  show: boolean;
  onClickOutside: () => void;
  space: any;
};
const InviteModal = ({ show, onClickOutside, space }: InviteModal) => {
  const { sid } = useRouter().query;
  const ref = useRef(null);
  const {
    data: spaceMembers,
    error: spaceMembersError,
    isLoading: spaceMembersAreLoading,
  } = useSWR(`/api/spaces/${sid}/members`, fetcher);
  const { trigger: inviteMemberTrigger } = useSWRMutation(
    `/api/spaces/${sid}/members`,
    poster,
    {
      onSuccess(spaceMember, key, config) {
        console.log("space member", spaceMember);
      },
      onError(err, key, config) {
        console.info(err);
      },
    }
  );
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClickOutside && onClickOutside();
      }
    };
    if (show) {
      document.addEventListener("click", handleClickOutside, true);
    } else {
      document.removeEventListener("click", handleClickOutside, true);
    }
  }, [show]);
  const renderMembers = spaceMembers?.map((member: any) => (
    <Member
      key={member.id}
      id={member.id}
      member={member.member}
      pendingEmail={member.pendingEmail}
      role={member.role}
      createdAt={member.createdAt}
    />
  ));

  return (
    <div
      ref={ref}
      className={clsx(
        show
          ? "opacity-100 visible scale-100 top-[3rem]"
          : "opacity-0 invisible scale-90 top-[2rem]",
        "transition-all absolute w-[350px] bg-white left-[5rem] text-slate-500 flex flex-col rounded-lg shadow-xl border border-slate-200"
      )}
    >
      <Form.Root
        className="px-4 py-3 flex flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          const { email } = Object.fromEntries(
            new FormData(event.currentTarget)
          );
          inviteMemberTrigger({ email: email.toString() });
        }}
      >
        <h3 className="text-lg text-black font-bold">
          Invite members to {space?.name}
        </h3>
        <Form.Field className="grid mr-2 w-full mb-3" name="email">
          <div className="flex items-baseline justify-between">
            <Form.Label className="text-[13px] font-bold leading-[35px] ">
              Email
            </Form.Label>
            <Form.Message
              className="text-[13px] opacity-[0.8]"
              match="valueMissing"
            >
              Please enter the email
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
              autoComplete="off"
              type="email"
              required
            />
          </Form.Control>
        </Form.Field>
        <Form.Submit asChild>
          <button className="transition-all box-border inline-flex h-[35px] items-center justify-center rounded bg-indigo-500 text-white px-[15px] hover:bg-indigo-600 font-medium leading-none focus:outline-none">
            Invite
          </button>
        </Form.Submit>
      </Form.Root>
      <Separator.Root className="bg-slate-200 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px my-2" />
      <div className="px-4 flex flex-col">
        <span className="text-sm font-semibold text-slate-900 mb-2 mt-1">
          Members
        </span>
        {renderMembers}
      </div>
    </div>
  );
};

export default InviteModal;
