'use client';

import { X } from 'lucide-react';
import React, { useRef } from 'react';

import { UserSearchResult } from '../hooks/use-user-search';

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onMentionSelect?: (user: UserSearchResult) => void;
  selectedMentions: UserSearchResult[];
  onRemoveMention: (userId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  forwardedRef?: React.Ref<HTMLTextAreaElement>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onInput?: (e: React.FormEvent<HTMLTextAreaElement>) => void;
}

export const MentionTextarea = React.forwardRef<HTMLTextAreaElement, MentionTextareaProps>(
  (
    {
      value,
      onChange,
      selectedMentions,
      onRemoveMention,
      placeholder,
      disabled,
      maxLength,
      onKeyDown,
      onInput,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Build display content with badges
    const renderContent = () => {
      let displayValue = value;

      // Replace mention text with badges
      selectedMentions.forEach((mention) => {
        const mentionText = `@${mention.userName}`;
        displayValue = displayValue.replace(mentionText, `[MENTION:${mention.id}]`);
      });

      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      const mentionRegex = /\[MENTION:([^\]]+)\]/g;
      let match;

      while ((match = mentionRegex.exec(displayValue)) !== null) {
        // Add text before mention
        if (match.index > lastIndex) {
          parts.push(displayValue.substring(lastIndex, match.index));
        }

        // Add mention badge
        const mentionId = match[1];
        const mention = selectedMentions.find((m) => m.id === mentionId);
        if (mention) {
          parts.push(
            <span
              key={`mention-${mentionId}`}
              className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 align-text-bottom text-xs font-medium text-blue-700"
            >
              <span>@{mention.userName}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onRemoveMention(mentionId);
                }}
                className="ml-0.5 hover:text-blue-900"
                title="Remove mention"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>,
          );
        }

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < displayValue.length) {
        parts.push(displayValue.substring(lastIndex));
      }

      return parts;
    };

    return (
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-lg border-0 bg-gray-100 transition-all focus-within:bg-white focus-within:shadow-md focus-within:ring-2 focus-within:ring-[#99b94a]"
        style={{
          minHeight: '36px',
          maxHeight: '120px',
        }}
      >
        {/* Hidden textarea */}
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onInput={onInput}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className="absolute inset-0 w-full resize-none rounded-lg bg-transparent px-4 py-2 pr-10 text-sm leading-relaxed text-transparent placeholder-transparent caret-gray-900 outline-none focus:outline-none disabled:bg-transparent disabled:text-transparent sm:text-[15px]"
          rows={1}
        />

        {/* Display layer with badges and text */}
        <div className="pointer-events-none w-full rounded-lg px-4 py-2 pr-10 text-sm leading-relaxed sm:text-[15px]">
          {value.length === 0 && !disabled && <span className="text-gray-500">{placeholder}</span>}
          {value.length > 0 && <div className="flex flex-wrap gap-1">{renderContent()}</div>}
          {disabled && <span className="text-gray-400">{renderContent()}</span>}
        </div>
      </div>
    );
  },
);

MentionTextarea.displayName = 'MentionTextarea';
