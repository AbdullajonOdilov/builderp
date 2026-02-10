import { useState, useRef, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { SubResource, SubResourceCategory } from '@/types/task';

interface SubResourceAutocompleteProps {
  value: string;
  category: SubResourceCategory;
  existingSubResources: SubResource[];
  onChange: (value: string) => void;
  onSelect: (resource: SubResource) => void;
  className?: string;
}

export function SubResourceAutocomplete({
  value,
  category,
  existingSubResources,
  onChange,
  onSelect,
  className,
}: SubResourceAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    if (!value || value.length < 1) return [];
    const lower = value.toLowerCase();
    // Deduplicate by name+category
    const seen = new Map<string, SubResource>();
    existingSubResources
      .filter(sr => sr.categoryName === category && sr.resourceName.toLowerCase().includes(lower) && sr.resourceName.toLowerCase() !== lower)
      .forEach(sr => {
        const key = `${sr.resourceName.toLowerCase()}`;
        if (!seen.has(key)) seen.set(key, sr);
      });
    return Array.from(seen.values()).slice(0, 6);
  }, [value, category, existingSubResources]);

  useEffect(() => {
    setOpen(focused && suggestions.length > 0);
  }, [suggestions, focused]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        className={className}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        placeholder="Name"
      />
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-md max-h-[160px] overflow-y-auto">
          {suggestions.map(sr => (
            <button
              key={sr.id}
              type="button"
              className="w-full text-left px-2 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between gap-2"
              onMouseDown={e => {
                e.preventDefault();
                onSelect(sr);
                setOpen(false);
              }}
            >
              <span className="truncate font-medium">{sr.resourceName}</span>
              <span className="text-muted-foreground shrink-0">{sr.resourceCode || '—'}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
