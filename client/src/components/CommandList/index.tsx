import React, { ReactNode, useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Editor, Text, Range, Transforms } from 'slate';
import { useSlate, ReactEditor } from 'slate-react';

import {CommandOptions} from './CommandOptions';

type CommandListProps = {
  target: Range | null | undefined
  command: string
  close: () => void
}
type PortalProps = { children?: ReactNode };

function Portal({ children }: PortalProps) {
  return typeof document === 'object'
    ? ReactDOM.createPortal(children, document.body)
    : null;
}
export const CommandList = ({target, command, close}:CommandListProps) => {
  const [mounted, setMounted] = useState(false)
  const [input, setInput] = useState('')
  const [test,setTest] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const editor = useSlate();
  // const command = useMemo(() => input.substring(1), [input])

  const commands = command ? CommandOptions.filter(({value, label}) =>
    label.toLowerCase().startsWith(command.toLowerCase())
  ).slice(0, 10) : CommandOptions

  useEffect(() => {
    setMounted(true)
    document.addEventListener("keypress", keyPressHandler);
      return () => {
        document.removeEventListener("keypress", keyPressHandler)
        setMounted(false)
      }
  }, [])

  useEffect(() => {
    if (target) {
      console.log(target,command)
      const el = ref.current
      if (el) {
        const domRange = ReactEditor.toDOMRange(editor, target)
        const rect = domRange.getBoundingClientRect()
        el.style.top = `${rect.top + window.pageYOffset + 24}px`
        el.style.left = `${rect.left + window.pageXOffset}px`
      }
    }
  }, [editor, target, command])

  const keyPressHandler = (event: KeyboardEvent) => {
    setInput(prev => prev + event.key)
  }

  return (
    mounted && target ? (
      <Portal>
        <div
          ref={ref}
          style={{
            top: '-9999px',
            left: '-9999px',
            position: 'absolute',
            zIndex: 1,
            padding: '3px',
            background: 'white',
            borderRadius: '4px',
            boxShadow: '0 1px 5px rgba(0,0,0,.2)',
          }}
        >
          {commands.map(({value, label}, i) => (
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
          ))}
        </div>
      </Portal>
    ): null
  )
}