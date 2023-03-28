import React, { useEffect, useRef } from "react";
import * as Form from "@radix-ui/react-form";
import clsx from "clsx";
type InviteModal = {
  show: boolean;
  onClickOutside: () => void;
};
const InviteModal = ({ show, onClickOutside }: InviteModal) => {
  const ref = useRef(null);
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

  return (
    <div
      ref={ref}
      className={clsx(
        show
          ? "opacity-100 visible scale-100 top-[3rem]"
          : "opacity-0 invisible scale-90 top-[2rem]",
        "transition-all absolute w-[350px] bg-white right-4 flex flex-col rounded-lg shadow-xl border border-slate-200"
      )}
    >
      <Form.Root
        className="bg-white px-5 py-4 text-slate-500 rounded-lg flex flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          const data = Object.fromEntries(new FormData(event.currentTarget));
          // createSpace(data);
        }}
      >
        <h3 className="text-xl text-black mb-1 font-bold">Invite others</h3>
        <Form.Field className="grid mb-[10px] w-full" name="email">
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
          <button className="transition-all box-border inline-flex h-10 items-center justify-center rounded bg-indigo-500 text-white px-[15px] hover:bg-indigo-600 font-medium leading-none focus:outline-none">
            Invite
          </button>
        </Form.Submit>
      </Form.Root>
    </div>
  );
};

export default InviteModal;
