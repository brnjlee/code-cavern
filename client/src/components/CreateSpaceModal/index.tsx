import React, { useEffect, useCallback, useState } from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import clsx from "clsx";
import useEmblaCarousel from "embla-carousel-react";
import * as Form from "@radix-ui/react-form";
import { IoChevronForwardSharp } from "react-icons/io5";

const CreateSpaceModal = ({
  show,
  close,
  createSpace,
}: {
  show: boolean;
  close: () => void;
  createSpace: (data: any) => void;
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    draggable: false,
  });
  const [createPath, setCreatePath] = useState("custom");
  useEffect(() => {
    if (emblaApi) {
      console.log(emblaApi.slideNodes()); // Access API
    }
  }, [emblaApi]);
  const scrollPrev = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      if (emblaApi) emblaApi.scrollPrev();
    },
    [emblaApi]
  );

  useEffect(() => {
    if (emblaApi) {
      setTimeout(() => emblaApi.scrollTo(0), 500);
    }
  }, [show]);

  const scrollNext = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      if (emblaApi) emblaApi.scrollNext();
    },
    [emblaApi]
  );
  const renderSecondSlide = () => {
    switch (createPath) {
      case "custom":
        return (
          <>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Customize your workspace
            </h2>
            <span className="mb-2">
              Give your new workspace a name and icon.
            </span>
            <Form.Field className="grid mb-[10px] w-full" name="name">
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
            <div className="flex items-center justify-between w-full mt-2">
              <button className="" onClick={scrollPrev}>
                Back
              </button>
              <Form.Submit asChild>
                <button className="transition-all box-border inline-flex h-10 items-center justify-center rounded bg-indigo-500 text-white px-[15px] hover:bg-indigo-600 font-medium leading-none focus:outline-none">
                  Create
                </button>
              </Form.Submit>
            </div>
          </>
        );
      case "join":
        return (
          <>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Join a workspace
            </h2>
            <span className="mb-2">
              Enter an invite below to join an existing workspace
            </span>
            <Form.Field className="grid mb-[10px] w-full" name="name">
              <div className="flex items-baseline justify-between">
                <Form.Label className="text-[13px] font-bold leading-[35px] ">
                  Invite link
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
            <div className="flex items-center justify-between w-full mt-2">
              <button className="" onClick={scrollPrev}>
                Back
              </button>
              <Form.Submit asChild>
                <button className="transition-all box-border inline-flex h-10 items-center justify-center rounded bg-indigo-500 text-white px-[15px] hover:bg-indigo-600 font-medium leading-none focus:outline-none">
                  Join
                </button>
              </Form.Submit>
            </div>
          </>
        );
    }
  };
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
          className="bg-white p-5 text-slate-500 rounded-lg flex flex-col items-center"
          onSubmit={(event) => {
            event.preventDefault();
            const data = Object.fromEntries(new FormData(event.currentTarget));
            createSpace(data);
          }}
        >
          <div className="embla">
            <div className="embla__viewport" ref={emblaRef}>
              <div className="embla__container w-[450px]">
                <div className="embla__slide">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    Create a workspace
                  </h2>
                  <span className="mb-2">
                    Select how you want to create your workspace
                  </span>
                  <button
                    onClick={(e) => {
                      scrollNext(e);
                      setCreatePath("custom");
                    }}
                    className="group transition-all box-border w-full inline-flex h-[3rem] items-center justify-center rounded-lg bg-white border border-slate-300 text-slate-700 px-[15px] hover:bg-slate-100 font-medium focus:outline-none mt-5"
                  >
                    Create My Own
                    <IoChevronForwardSharp className="transition-all group-hover:right-3 absolute right-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      scrollNext(e);
                      setCreatePath("join");
                    }}
                    className="group transition-all box-border w-full inline-flex h-[3rem] items-center justify-center rounded-lg bg-white border border-slate-300 text-slate-700 px-[15px] hover:bg-slate-100 font-medium focus:outline-none mt-2"
                  >
                    Join a Workspace
                    <IoChevronForwardSharp className="transition-all group-hover:right-3 absolute right-5" />
                  </button>
                </div>
                <div className="embla__slide">{renderSecondSlide()}</div>
              </div>
            </div>
          </div>
        </Form.Root>
      </div>
    </div>
  );
};

export default CreateSpaceModal;
