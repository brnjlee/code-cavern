import React, {ReactNode} from 'react';
import * as S from '@radix-ui/react-select';
import clsx from 'clsx';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';

type ItemType = { value: string, label: string}
type SelectRootProps = { value: string, items: ItemType[], onValueChange:(type: string)=>void }
export const Select = ({value, items, onValueChange}: SelectRootProps) => {
  const renderSelectItems = items.map(({value, label}, i) => (
    <S.Item
      key={i}
      value={value}
      className='text-[13px] whitespace-nowrap leading-none text-violet11 rounded-[3px] flex items-center h-[25px] pr-[35px] pl-[25px] relative hover:cursor-pointer hover:bg-gray-100 select-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1'
    >
      <S.ItemText>{label}</S.ItemText>
      <S.ItemIndicator className="absolute left-0 w-[25px] inline-flex items-center justify-center">
        <CheckIcon />
      </S.ItemIndicator>
    </S.Item>
  ))

  return (
    <S.Root value={value} onValueChange={onValueChange}>
      <S.Trigger
        className="inline-flex items-center justify-center px-[15px] text-[13px] leading-none h-auto gap-[5px] bg-white text-violet11 hover:bg-mauve3 hover:cursor-pointer hover:bg-gray-100 data-[placeholder]:text-violet9 border-gray-200 border-r outline-none"
        aria-label="Food"
      >
        <S.Value placeholder="Select an option" />
        <S.Icon className="text-violet11">
          <ChevronDownIcon />
        </S.Icon>
      </S.Trigger>
      <S.Portal>
        <S.Content className="absolute z-20 overflow-hidden bg-white rounded-md shadow-2xl border border-gray-200">
          <S.ScrollUpButton className="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default">
            <ChevronUpIcon />
          </S.ScrollUpButton>
          <S.Viewport className="p-[5px]">
            <S.Group>
              <S.Label className="px-[25px] text-gray-400 font-semibold text-2xs leading-[25px] text-mauve11">
                Turn into
              </S.Label>
              {renderSelectItems}
            </S.Group>
          </S.Viewport>
          <S.ScrollDownButton className="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default">
            <ChevronDownIcon />
          </S.ScrollDownButton>
        </S.Content>
      </S.Portal>
    </S.Root>
  )
};