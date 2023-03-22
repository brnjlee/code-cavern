import React from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import clsx from "clsx";
import { CaretDownIcon } from "@radix-ui/react-icons";
import * as Form from "@radix-ui/react-form";

const CreateSpaceModal = ({
  show,
  close,
  createSpace,
}: {
  show: boolean;
  close: () => void;
  createSpace: (data: any) => void;
}) => {
  return (
    <div
      className={clsx(
        show ? "opacity-100 visible" : "opacity-0 invisible",
        "fixed transition-all inset-0 bg-slate-300/[.7] flex items-center justify-center"
      )}
      onClick={close}
    >
      <div
        className={clsx(
          show
            ? "opacity-100 visible scale-100 delay-100"
            : "opacity-0 invisible scale-75",
          "transition-all flex flex-col bg-white rounded-lg "
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <Form.Root
          className="w-[450px] bg-white p-5 text-slate-500 rounded-lg flex flex-col items-center"
          onSubmit={(event) => {
            event.preventDefault();
            const data = Object.fromEntries(new FormData(event.currentTarget));
            createSpace(data);
          }}
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Create a workspace
          </h2>
          <span className="mb-2">
            Select how you want to create your workspace
          </span>
          <div className="w-full">
            <Form.Field className="grid mb-[10px]" name="name">
              <div className="flex items-baseline justify-between">
                <Form.Label className="text-[13px] font-bold leading-[35px] ">
                  Name
                </Form.Label>
                <Form.Message
                  className="text-[13px] opacity-[0.8]"
                  match="valueMissing"
                >
                  Please enter the workspace name
                </Form.Message>
                <Form.Message
                  className="text-[13px] opacity-[0.8]"
                  match="typeMismatch"
                >
                  Please provide a valid workspace name
                </Form.Message>
              </div>
              <Form.Control asChild>
                <input
                  className="transition-all box-border border border-slate-300 w-full inline-flex h-[35px] appearance-none items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none outline-none hover:border-slate-600 focus:border-slate-600"
                  autoComplete="off"
                  type="text"
                  required
                />
              </Form.Control>
            </Form.Field>
          </div>

          <Form.Submit asChild>
            <button className="transition-all box-border w-full inline-flex h-10 items-center justify-center rounded bg-indigo-500 text-white px-[15px] hover:bg-indigo-600 font-medium leading-none focus:outline-none mt-5">
              Create
            </button>
          </Form.Submit>
        </Form.Root>
      </div>
    </div>
  );
};

export default CreateSpaceModal;
