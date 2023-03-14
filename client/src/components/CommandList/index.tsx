import React, { ReactNode, useState, useEffect, useRef, useMemo,useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Editor, Text, Range, Transforms } from 'slate';
import { useSlate, ReactEditor } from 'slate-react';
import clsx from 'clsx'
import {ListsEditor} from '@prezly/slate-lists'

import {ElementType} from '../../types'
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

const headingOffset = (type:string) => {
  switch(type) {
    case ElementType.HEADING_ONE:
      return -20
    case ElementType.HEADING_TWO:
      return 2
    case ElementType.HEADING_THREE:
      return 8
    default:
      return 15
  }
}
export const CommandList = ({target, close}:CommandListProps) => {
  const [mounted, setMounted] = useState(false)
  const [index, setIndex] = useState(0)
  const indexRef = useRef(index)
  const selectionIndex = useRef(0)
  const [input, setInput] = useState('')
  const inputRef = useRef(input)
  
  const ref = useRef<HTMLDivElement>(null)
  const editor = useSlate();
  const command = input.substring(1)
  
  const filterCommands = (command: string) => CommandOptions.filter(({value, label}) =>
    label.toLowerCase().startsWith(command.toLowerCase())
  ).slice(0, 10)

  const commands = filterCommands(command)
  const commandsRef = useRef(commands)
 
  useEffect(() => {
    setMounted(true)
    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keypress", keyPressHandler);
      return () => {
        document.removeEventListener("keydown", keyDownHandler);
        document.removeEventListener("keypress", keyPressHandler);
        setMounted(false)
      }
  }, [])

  useEffect(() => {
    if (target) {
      const el = ref.current
      if (el) {
        const { selection } = editor;
        const selectionType = editor.children[selection.anchor.path[0]].type
        const domRange = ReactEditor.toDOMRange(editor, target)
        const rect = domRange.getBoundingClientRect()
        el.style.top = `${rect.top + window.pageYOffset - headingOffset(selectionType)}px`
        el.style.left = `${rect.left + window.pageXOffset - 35}px`
      }
    }
  }, [editor, target, command, commands.length])

  const keyDownHandler = (e:KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault()
        const selected = commandsRef.current[indexRef.current]?.value
        changeElementType(editor, selected)
        close()
        break
      case 'Backspace':
        if (inputRef.current.length === 1) close()
        setIndex(0)
        indexRef.current = 0
        selectionIndex.current -= 1
        setInput(prev => {
          const newInput = prev.substring(0,prev.length-1)
          commandsRef.current = filterCommands(newInput.substring(1))
          inputRef.current = newInput
          return newInput
        })
        break
      case 'ArrowUp':
        e.preventDefault()
        setIndex(prev => {
          const newIndex = prev === 0 ? commandsRef.current.length-1 : prev-1
          indexRef.current = newIndex
          return newIndex
        })
        break
      case 'ArrowDown':
        e.preventDefault()
        setIndex(prev => {
          const newIndex = prev >= commandsRef.current.length-1 ? 0 : prev+1
          indexRef.current = newIndex
          return newIndex
        })
        break
      case 'ArrowLeft':
        if (selectionIndex.current === 1) close()
        selectionIndex.current -= 1
        break
      case 'ArrowRight':
        if (selectionIndex.current === inputRef.current.length) close()
        selectionIndex.current += 1
        break
      case 'Tab':
      case ' ':
        close()
        break
    }
  }
  const keyPressHandler = (e:KeyboardEvent) => {
    setIndex(0)
    indexRef.current = 0
    selectionIndex.current += 1
    setInput(prev => {
      const newInput = prev+e.key
      inputRef.current = newInput
      commandsRef.current = filterCommands(newInput.substring(1))
      return newInput
    })
  }

  const changeElementType = (editor: Editor, type: string) => {
    ListsEditor.unwrapList(editor)
    const { selection } = editor
    if (selection) {
      const {text} = Editor.node(editor, selection)[0]
      if (text.length === inputRef.current.length) {
        Transforms.removeNodes(editor)
      }
      else {
        console.log(inputRef.current.length)
        for (let i = 0; i < inputRef.current.length; i++) {
          editor.deleteBackward('character')
        }
      }
      const isList = type === 'ordered-list' || type === 'unordered-list'
      const newChildren = isList ?[{ 
        type: "list-item", children: [{ type: 'list-item-text', children: [{text: "" }]}]
      }] : [{
        text: ''
      }]
      console.log(newChildren, type, isList)
      Transforms.insertNodes(
          editor,
          { type, children: newChildren }
      )
    }
  }

  const renderCommands = commands.map(({value, label,description, image}, key) => {
    const isSelected = commands.map(e => e.value).indexOf(value) === index
    return (
      <div
        key={value}
        className={clsx( isSelected && 'bg-gray-100', 'flex py-1 rounded', 'hover:bg-gray-100')}
        role="button"
        tabIndex={0}
        onClick={() => changeElementType(editor, value)}
      >
        <img
          src={image}
          className={clsx(isSelected && 'border-gray-300', 'border-gray-200','h-10 w-10 border object-cover rounded mx-2 bg-white')}
          alt={label}
        />
        <div
          className='flex flex-col justify-center'
        >
          <span className='text-sm'>{label}</span>  
          <span className='text-xs text-gray-400'>{description}</span>
        </div>
      </div>
    )
  })
  return (
    <div
      ref={ref}
      style={{
        top: '-9999px',
        left: '-9999px',
      }}
      className={clsx(mounted ? 'scale-1 opacity-100': 'scale-0 opacity-0','command-list-open w-150 max-h-80 overflow-y-scroll transition-scale origin-top-left absolute p-1 z-10 bg-white rounded shadow-3xl border border-gray-200 ')}
    >
      {commands.length ? (
        <>
          <div className='text-xs text-gray-400 p-2 font-semibold'>Text blocks</div>
          {renderCommands}
        </>
      ): <span className='text-sm text-gray-500 mx-2'>No results</span>}
    </div>
  )
}