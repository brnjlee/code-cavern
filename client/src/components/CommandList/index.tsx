import React, { ReactNode, useState, useEffect, useRef, useMemo,useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Editor, Text, Range, Transforms } from 'slate';
import { useSlate, ReactEditor } from 'slate-react';
import clsx from 'clsx'

import {CommandOptions} from './CommandOptions';

type CommandListProps = {
  target: Range | null | undefined
  close: () => void
}
type PortalProps = { children?: ReactNode };

function Portal({ children }: PortalProps) {
  return typeof document === 'object'
    ? ReactDOM.createPortal(children, document.body)
    : null;
}
export const CommandList = ({target, close}:CommandListProps) => {
  const [mounted, setMounted] = useState(false)
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const inputRef = useRef(input)
  const ref = useRef<HTMLDivElement>(null)
  const editor = useSlate();
  const command = input.substring(1)
  

  const commands = useMemo(() => CommandOptions.filter(({value, label}) =>
    label.toLowerCase().startsWith(command.toLowerCase())
  ).slice(0, 10), [command])
 
  useEffect(() => {
    setMounted(true)
    document.addEventListener("keydown", keyDownHandler);
      return () => {
        // document.removeEventListener("keydown", keyDownHandler);
        setMounted(false)
      }
  }, [])

  useEffect(() => {
    console.log('target', target)
    if (target) {
      // console.log(target,input,command,commands)
      const el = ref.current
      if (el) {
        console.log('has element')
        const domRange = ReactEditor.toDOMRange(editor, target)
        const rect = domRange.getBoundingClientRect()
        el.style.top = `${rect.top + window.pageYOffset + 24}px`
        el.style.left = `${rect.left + window.pageXOffset}px`
      }
    }
  }, [editor, target, command, commands.length])

  const keyDownHandler = (e:KeyboardEvent) => {
    switch (e.key) {
      case 'Backspace':
        if (inputRef.current.length === 1) close()
        setInput(prev => {
          inputRef.current = prev.substring(0,prev.length-1)
          return prev.substring(0,prev.length-1)
        })
        break
      case 'ArrowUp':
        e.preventDefault()
        setIndex(index === 0 ? commands.length-1 : index-1)
        break
      case 'ArrowDown':
        e.preventDefault()
        setIndex(index >= commands.length-1 ? 0 : index+1)
        break
      default:
        setInput(prev => {
          inputRef.current = prev+e.key
          return prev+e.key
        })
        break
    }
  }

  const renderCommands = commands.map(({value, label}, i) => (
    <div
      key={value}
      style={{
        padding: '1px 3px',
        borderRadius: '3px',
        background: i === 0 ? '#B4D5FF' : 'transparent',
      }}
    >
      {label}
    </div>
  ))
  return (
    <div
      ref={ref}
      style={{
        top: '-9999px',
        left: '-9999px',
      }}
      className={clsx(mounted ? 'scale-1 opacity-100': 'scale-0 opacity-0','transition-scale origin-top-left absolute p-3 z-10 bg-white rounded shadow-3xl border border-gray-200 ')}
    >
      {commands.length ? renderCommands: 'No results'}
    </div>
  )
}