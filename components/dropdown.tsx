"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

interface DropdownOption {
  value: string
  label: string
  icon?: React.ReactNode
}

interface DropdownProps {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  placeholder: string
  icon?: React.ReactNode
  className?: string
}

export function Dropdown({ options, value, onChange, placeholder, icon, className = "" }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((option) => option.value === value)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2.5 hover:bg-white/10 transition-colors"
      >
        <div className="flex items-center gap-2 truncate">
          {icon && (
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 ring-1 ring-white/20">
              {icon}
            </span>
          )}
          <span className="text-sm text-zinc-200 font-medium truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown className={`text-zinc-300 transition-transform ${isOpen ? "rotate-180" : ""}`} size={18} />
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-2 w-full rounded-xl ring-1 ring-white/10 bg-[#0c0f16] shadow-2xl overflow-hidden">
          <div className="max-h-60 overflow-y-auto divide-y divide-white/5">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className="w-full text-left px-3 py-2 hover:bg-white/5 text-sm text-zinc-200 dropdown-option transition-colors"
              >
                <div className="flex items-center gap-2">
                  {option.icon && (
                    <span className="inline-flex h-6 w-6 items-center justify-center">{option.icon}</span>
                  )}
                  {option.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
