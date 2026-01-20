'use client';

import React, { useRef, useCallback, useEffect } from 'react';
import { Bold, Italic, Minus } from 'lucide-react';

interface SimpleRichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SimpleRichEditor({ 
  value, 
  onChange, 
  placeholder = "Start typing...",
  className = ""
}: SimpleRichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Execute formatting command
  const executeCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    
    // Trigger onChange after command execution
    setTimeout(() => {
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    }, 0);
  }, [onChange]);

  // Handle content changes
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Insert divider line
  const insertDivider = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      // Create divider element
      const divider = document.createElement('hr');
      divider.style.border = 'none';
      divider.style.borderTop = '2px solid #e5e7eb';
      divider.style.margin = '16px 0';
      
      // Insert divider
      range.deleteContents();
      range.insertNode(divider);
      
      // Move cursor after divider
      const newRange = document.createRange();
      newRange.setStartAfter(divider);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
      
      handleInput();
    }
  }, [handleInput]);

  // Handle key shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          executeCommand('italic');
          break;
      }
    }
  }, [executeCommand]);

  // Set initial content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  // Handle paste to clean up formatting
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  return (
    <div className={`border border-gray-300 rounded-xl focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-xl">
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          className="p-2 rounded hover:bg-gray-200 transition-colors"
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        
        <button
          type="button"
          onClick={() => executeCommand('italic')}
          className="p-2 rounded hover:bg-gray-200 transition-colors"
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <button
          type="button"
          onClick={insertDivider}
          className="p-2 rounded hover:bg-gray-200 transition-colors"
          title="Insert Divider"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className="min-h-[120px] p-4 focus:outline-none"
        style={{ 
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        
        [contenteditable] strong {
          font-weight: bold;
        }
        
        [contenteditable] em {
          font-style: italic;
        }
        
        [contenteditable] hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 16px 0;
        }
      `}</style>
    </div>
  );
}