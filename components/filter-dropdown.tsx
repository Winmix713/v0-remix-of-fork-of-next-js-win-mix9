"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"

interface FilterDropdownProps {
  label: string
  icon: string
  iconBg: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}

export function FilterDropdown({ label, icon, iconBg, options, value, onChange }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && window.lucide) {
      window.lucide.createIcons()
    }
  }, [isOpen])

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [handleClickOutside])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false)
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      setIsOpen(!isOpen)
    }
  }

  const selectedOption = options.find((opt) => opt.value === value) || options[0]

  return (
    <div className="relative" ref={dropdownRef} data-dropdown={icon}>
      <label className="block text-xs text-zinc-400 mb-1.5">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        data-trigger=""
        className="w-full flex items-center justify-between rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2.5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200"
      >
        <div className="flex items-center gap-2 truncate">
          <span
            className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${iconBg.includes("gradient") ? `bg-gradient-to-br ${iconBg}` : iconBg} ${iconBg.includes("ring") ? "" : "ring-1 ring-white/20"}`}
          >
            <i
              data-lucide={icon}
              className={iconBg.includes("gradient") ? "text-white" : "text-zinc-200"}
              style={{ width: "16px", height: "16px", strokeWidth: "1.5" }}
            ></i>
          </span>
          <span className="text-sm text-zinc-200 font-medium truncate" data-label="">
            {selectedOption.label}
          </span>
        </div>
        <i
          data-lucide="chevron-down"
          className={`text-zinc-300 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          style={{ width: "18px", height: "18px", strokeWidth: "1.5" }}
        ></i>
      </button>
      {isOpen && (
        <div
          data-menu=""
          className="absolute z-50 mt-2 w-full rounded-xl ring-1 ring-white/10 bg-[#0c0f16] shadow-2xl overflow-hidden"
        >
          <div className="max-h-60 overflow-y-auto divide-y divide-white/5" role="listbox" data-options="">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false) // Ensure dropdown closes after selection
                }}
                role="option"
                aria-selected={option.value === value}
                className={`w-full px-4 py-3 text-left text-sm hover:bg-white/5 flex items-center gap-3 transition-colors duration-150 dropdown-option ${
                  option.value === value ? "text-violet-300 bg-white/5" : "text-zinc-200"
                }`}
              >
                {option.label}
                {option.value === value && (
                  <i
                    data-lucide="check"
                    className="ml-auto text-violet-400"
                    style={{ width: "16px", height: "16px", strokeWidth: "1.5" }}
                  ></i>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
