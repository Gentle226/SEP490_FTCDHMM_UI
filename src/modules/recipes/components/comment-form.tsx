'use client';

import { SendHorizontal } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/modules/auth/contexts/auth.context';
import { useProfile } from '@/modules/profile';

import { UserSearchResult, useUserSearch } from '../hooks/use-user-search';
import { MentionTextarea } from './mention-textarea';

interface CommentFormProps {
  parentCommentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  onCreateComment?: (
    parentCommentId: string | undefined,
    content: string,
    mentionedUserIds?: string[],
  ) => Promise<void>;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  parentCommentId,
  onSuccess,
  onCancel,
  onCreateComment,
}) => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { searchUsers } = useUserSearch();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedMentions, setSelectedMentions] = useState<UserSearchResult[]>([]);
  const [mentionResults, setMentionResults] = useState<UserSearchResult[]>([]);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 });
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionDropdownRef = useRef<HTMLDivElement>(null);

  // Get avatar URL from profile
  const avatarUrl = profile?.avatarUrl ? profile.avatarUrl : null;

  // Handle @ mention detection in textarea
  const handleContentChange = async (newContent: string) => {
    setContent(newContent);

    // Get cursor position from textarea ref
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = newContent.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      // Check if there's a space or special character after @ (not part of a mention)
      const mentionMatch = textAfterAt.match(/^([a-zA-Z0-9._-]*)$/);

      if (mentionMatch) {
        const searchQuery = mentionMatch[1];

        // Show dropdown when @ is typed, show all users when empty query, filter by 2+ chars
        if (searchQuery.length === 0 || searchQuery.length >= 2) {
          const results = await searchUsers(searchQuery, user?.id);
          const unmentionedResults = results.filter(
            (r) => !selectedMentions.some((m) => m.id === r.id),
          );
          setMentionResults(unmentionedResults);
          setShowMentionDropdown(true);
          setHighlightedIndex(-1); // Reset highlight when results change

          // Calculate dropdown position
          calculateCursorPosition(textarea);
        } else {
          setShowMentionDropdown(false);
        }
      } else {
        setShowMentionDropdown(false);
      }
    } else {
      setShowMentionDropdown(false);
      setMentionResults([]);
    }
  };

  const calculateCursorPosition = (textarea: HTMLTextAreaElement) => {
    const { selectionStart } = textarea;
    const textBeforeCursor = textarea.value.substring(0, selectionStart);
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines[lines.length - 1];
    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);

    const left = currentLine.length * 8; // Approximate character width
    const top = (lines.length - 1) * lineHeight;

    setCursorPosition({ top, left });
  };

  const handleMentionSelect = (user: UserSearchResult) => {
    // Insert mention into textarea
    const cursorPos = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = content.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    // Get text before @ and after cursor, removing the partial mention text
    const beforeMention = content.substring(0, lastAtIndex);
    const afterMention = content.substring(cursorPos);

    const mentionText = `@${user.userName} `;
    const newContent = beforeMention + mentionText + afterMention;

    setContent(newContent);
    setSelectedMentions([...selectedMentions, user]);
    setShowMentionDropdown(false);
    setMentionResults([]);
    setHighlightedIndex(-1);

    // Move cursor after mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = beforeMention.length + mentionText.length;
        textareaRef.current.selectionStart = newCursorPos;
        textareaRef.current.selectionEnd = newCursorPos;
        textareaRef.current.focus();
      }
    }, 0);
  };

  // Handle keyboard navigation in mention dropdown
  const handleKeyDownInDropdown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showMentionDropdown || mentionResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < mentionResults.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < mentionResults.length) {
          handleMentionSelect(mentionResults[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowMentionDropdown(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mentionDropdownRef.current &&
        !mentionDropdownRef.current.contains(event.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(event.target as Node)
      ) {
        setShowMentionDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll highlighted item into view when using arrow keys
  useEffect(() => {
    if (highlightedIndex >= 0 && mentionDropdownRef.current) {
      const buttons = mentionDropdownRef.current.querySelectorAll('button');
      const highlightedButton = buttons[highlightedIndex] as HTMLElement;
      if (highlightedButton) {
        const scrollContainer = mentionDropdownRef.current.querySelector(
          '.overflow-y-auto',
        ) as HTMLElement;
        if (scrollContainer) {
          highlightedButton.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }
  }, [highlightedIndex]);

  if (!user) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-700">
        Vui lòng đăng nhập để thêm bình luận
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Vui lòng nhập bình luận');
      return;
    }

    if (content.length > 2048) {
      toast.error('Bình luận không được vượt quá 2048 ký tự');
      return;
    }

    setSubmitting(true);
    try {
      const mentionedUserIds = selectedMentions.map((m) => m.id);

      // Clean content by removing mentions from selectedMentions
      let cleanedContent = content.trim();

      // First, remove selected mentions by username
      selectedMentions.forEach((mention) => {
        const escapedUsername = mention.userName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(`@${escapedUsername}\\s?`, 'g');
        cleanedContent = cleanedContent.replace(pattern, '');
      });

      cleanedContent = cleanedContent.trim();

      // Validate cleaned content is not empty after removing mentions
      if (!cleanedContent) {
        toast.error('Vui lòng nhập nội dung bình luận, không chỉ mention!');
        setSubmitting(false);
        return;
      }

      if (onCreateComment) {
        await onCreateComment(parentCommentId, cleanedContent, mentionedUserIds);
      }

      setContent('');
      setSelectedMentions([]);
      toast.success(parentCommentId ? 'Đã trả lời bình luận' : 'Bình luận đã được gửi');
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi khi gửi bình luận';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        {/* User Avatar - stays at top left */}
        <div className="mt-0 flex flex-shrink-0">
          <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gray-300 text-xs font-semibold text-white sm:h-9 sm:w-9 sm:text-sm">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={user?.firstName || user?.email}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>
                {(user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Input Container */}
        <div className="relative flex-1">
          {/* Mention-enabled textarea with badges inside */}
          <MentionTextarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            selectedMentions={selectedMentions}
            placeholder={
              parentCommentId
                ? 'Viết trả lời... (gõ @ để đề cập ai đó)'
                : 'Viết bình luận của bạn... (gõ @ để đề cập ai đó)'
            }
            disabled={submitting}
            maxLength={2048}
            onKeyDown={(e) => {
              // Handle dropdown navigation first
              handleKeyDownInDropdown(e);

              // Then handle form submission if dropdown is not open or Enter wasn't consumed
              if (e.key === 'Enter' && !e.shiftKey && !e.defaultPrevented && !showMentionDropdown) {
                e.preventDefault();
                if (content.trim()) {
                  handleSubmit(
                    e as React.KeyboardEvent<HTMLTextAreaElement> &
                      React.FormEvent<HTMLFormElement>,
                  );
                }
              }
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 120) + 'px';
            }}
          />

          {/* Mention Dropdown - wider */}
          {showMentionDropdown && (
            <div
              ref={mentionDropdownRef}
              className="absolute z-50 w-80 rounded-lg border border-gray-200 bg-white shadow-lg"
              // Dynamic positioning requires inline styles for cursor-relative placement
              style={{
                top: `calc(100% + ${cursorPosition.top + 8}px)`,
                left: `${Math.max(0, cursorPosition.left)}px`,
              }}
            >
              {mentionResults.length > 0 ? (
                <div className="max-h-48 overflow-y-auto">
                  {mentionResults.map((user, index) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleMentionSelect(user)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onMouseLeave={() => setHighlightedIndex(-1)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                        index === highlightedIndex ? 'bg-[#99b94a]' : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-gray-300">
                        {user.avatarUrl ? (
                          <Image
                            src={user.avatarUrl}
                            alt={user.userName}
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-white">
                            {(user.firstName?.charAt(0) || 'U').toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1">
                        <div
                          className={`font-medium ${
                            index === highlightedIndex ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          @{user.userName}
                        </div>
                        <div
                          className={`text-sm ${
                            index === highlightedIndex ? 'text-gray-100' : 'text-gray-500'
                          }`}
                        >
                          {user.firstName} {user.lastName}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-3 text-center text-sm text-gray-500">
                  Không tìm thấy người dùng
                </div>
              )}
            </div>
          )}

          {/* Send Button - positioned absolutely inside the input */}
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="absolute top-1/2 right-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-transparent text-[#99b94a] transition-colors hover:text-[#88a840] disabled:cursor-not-allowed disabled:text-gray-300 disabled:opacity-50"
            title="Gửi (Enter)"
          >
            <SendHorizontal className="h-4 w-4" />
          </button>

          {/* Character counter - always present to prevent layout shift */}
          <div
            className={`absolute right-2 -bottom-5 text-xs transition-opacity ${content.length > 0 ? 'text-gray-400 opacity-100' : 'text-transparent opacity-0'}`}
          >
            {content.length} / 2048
          </div>
        </div>
      </div>

      {/* Cancel button for replies */}
      {parentCommentId && onCancel && (
        <div className="flex justify-start pl-5 sm:pl-11">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="text-xs font-semibold text-gray-600 transition-colors hover:text-gray-800 hover:underline disabled:opacity-50"
          >
            Hủy
          </button>
        </div>
      )}
    </form>
  );
};
