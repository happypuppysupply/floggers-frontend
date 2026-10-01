'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, ChevronDown } from 'lucide-react'

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string, city?: string, state?: string) => void
  placeholder?: string
  savedLocations?: string[]
  className?: string
}

// Common US cities for autocomplete
const US_CITIES = [
  'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
  'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
  'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC',
  'San Francisco, CA', 'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Washington, DC',
  'Boston, MA', 'El Paso, TX', 'Nashville, TN', 'Detroit, MI', 'Oklahoma City, OK',
  'Portland, OR', 'Las Vegas, NV', 'Louisville, KY', 'Baltimore, MD', 'Milwaukee, WI',
  'Albuquerque, NM', 'Tucson, AZ', 'Fresno, CA', 'Sacramento, CA', 'Mesa, AZ',
  'Kansas City, MO', 'Atlanta, GA', 'Long Beach, CA', 'Colorado Springs, CO', 'Raleigh, NC',
  'Miami, FL', 'Virginia Beach, VA', 'Omaha, NE', 'Oakland, CA', 'Minneapolis, MN',
  'Tulsa, OK', 'Arlington, TX', 'Wichita, KS', 'Bakersfield, CA', 'Aurora, CO'
]

export default function LocationAutocomplete({ 
  value, 
  onChange, 
  placeholder = "City, State",
  savedLocations = [],
  className = ""
}: LocationAutocompleteProps) {
  const [input, setInput] = useState(value)
  const [showDropdown, setShowDropdown] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInput(value)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInput(newValue)
    
    // Generate suggestions
    if (newValue.length > 1) {
      const allLocations = [...savedLocations, ...US_CITIES]
      const filtered = allLocations.filter(loc => 
        loc.toLowerCase().includes(newValue.toLowerCase())
      ).slice(0, 8)
      setSuggestions(filtered)
      setShowDropdown(filtered.length > 0)
    } else {
      // Show saved locations if input is short
      if (savedLocations.length > 0) {
        setSuggestions(savedLocations.slice(0, 5))
        setShowDropdown(true)
      } else {
        setShowDropdown(false)
      }
    }

    // Parse city/state from input
    const parsed = parseCityState(newValue)
    onChange(newValue, parsed.city, parsed.state)
  }

  const handleSelect = (location: string) => {
    setInput(location)
    const parsed = parseCityState(location)
    onChange(location, parsed.city, parsed.state)
    setShowDropdown(false)
  }

  const handleFocus = () => {
    if (savedLocations.length > 0) {
      setSuggestions(savedLocations.slice(0, 5))
      setShowDropdown(true)
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-500" />
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="w-full bg-noir-950 border border-noir-700 rounded-lg pl-10 pr-10 py-2.5 text-sm text-noir-100 focus:outline-none focus:border-violet/50"
        />
        {savedLocations.length > 0 && (
          <ChevronDown 
            size={16} 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-noir-500 cursor-pointer"
            onClick={() => setShowDropdown(!showDropdown)}
          />
        )}
      </div>
      
      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-noir-900 border border-noir-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {savedLocations.length > 0 && suggestions.some(s => savedLocations.includes(s)) && (
            <div className="px-3 py-2 text-xs text-violet/70 font-medium border-b border-noir-800">
              Your Saved Locations
            </div>
          )}
          {suggestions.map((location, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(location)}
              className="w-full px-3 py-2 text-left text-sm text-noir-200 hover:bg-noir-800 transition-colors flex items-center gap-2"
            >
              <MapPin size={14} className="text-noir-500" />
              {location}
              {savedLocations.includes(location) && (
                <span className="text-[10px] text-violet/70 ml-auto">Saved</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function parseCityState(input: string): { city?: string; state?: string } {
  const match = input.match(/^([^,]+),?\s*([A-Z]{2})?$/)
  if (match) {
    return {
      city: match[1]?.trim(),
      state: match[2]?.trim()
    }
  }
  return {}
}
