import React, { useCallback, useMemo } from 'react';
import { createEditor, Descendant, Editor, Transforms, Element as SlateElement, BaseEditor } from 'slate';
import { Slate, Editable, withReact, RenderLeafProps, RenderElementProps, ReactEditor } from 'slate-react';
import { withHistory, HistoryEditor } from 'slate-history';
import { 
  Bold, 
  Italic, 
  Underline, 
  Heading1, 
  Heading2, 
  Quote, 
  List, 
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Minus
} from 'lucide-react';

type CustomText = { 
  text: string; 
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

type ParagraphElement = { type: 'paragraph'; align?: string; children: CustomText[] };
type HeadingOneElement = { type: 'heading-one'; align?: string; children: CustomText[] };
type HeadingTwoElement = { type: 'heading-two'; align?: string; children: CustomText[] };
type BlockQuoteElement = { type: 'block-quote'; align?: string; children: CustomText[] };
type NumberedListElement = { type: 'numbered-list'; children: ListItemElement[] };
type BulletedListElement = { type: 'bulleted-list'; children: ListItemElement[] };
type ListItemElement = { type: 'list-item'; children: CustomText[] };
type DividerElement = { type: 'divider'; children: CustomText[] };

type CustomElement = 
  | ParagraphElement 
  | HeadingOneElement 
  | HeadingTwoElement 
  | BlockQuoteElement 
  | NumberedListElement 
  | BulletedListElement 
  | ListItemElement 
  | DividerElement;

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

interface SlateEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const EMPTY_VALUE: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  } as ParagraphElement,
];

const serialize = (nodes: Descendant[]): string => {
  return nodes.map(n => SlateElement.isElement(n) ? n.children.map(c => ('text' in c ? c.text : '')).join('') : '').join('\n');
};

const deserialize = (text: string): Descendant[] => {
  if (!text || text.trim() === '') return EMPTY_VALUE;
  
  const lines = text.split('\n');
  return lines.map(line => ({
    type: 'paragraph',
    children: [{ text: line }],
  } as ParagraphElement));
};

const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  const customLeaf = leaf as CustomText;
  
  if (customLeaf.bold) {
    children = <strong>{children}</strong>;
  }
  if (customLeaf.italic) {
    children = <em>{children}</em>;
  }
  if (customLeaf.underline) {
    children = <u>{children}</u>;
  }
  
  return <span {...attributes}>{children}</span>;
};

const Element = ({ attributes, children, element }: RenderElementProps) => {
  const style = { textAlign: (element as any).align || 'left' };
  
  switch (element.type) {
    case 'heading-one':
      return <h1 {...attributes} style={style} className="text-3xl font-bold mb-4">{children}</h1>;
    case 'heading-two':
      return <h2 {...attributes} style={style} className="text-2xl font-bold mb-3">{children}</h2>;
    case 'block-quote':
      return <blockquote {...attributes} style={style} className="border-l-4 border-gray-300 pl-4 italic text-gray-700">{children}</blockquote>;
    case 'numbered-list':
      return <ol {...attributes} className="list-decimal ml-6">{children}</ol>;
    case 'bulleted-list':
      return <ul {...attributes} className="list-disc ml-6">{children}</ul>;
    case 'list-item':
      return <li {...attributes}>{children}</li>;
    case 'divider':
      return <hr {...attributes} className="my-4 border-gray-300" />;
    default:
      return <p {...attributes} style={style} className="mb-2">{children}</p>;
  }
};

export function SlateEditor({ value, onChange, placeholder, className }: SlateEditorProps) {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  
  const initialValue = useMemo(() => deserialize(value), []);
  
  const handleChange = useCallback((newValue: Descendant[]) => {
    const isAstChange = editor.operations.some(
      op => op.type !== 'set_selection'
    );
    if (isAstChange) {
      const serialized = serialize(newValue);
      onChange(serialized);
    }
  }, [editor, onChange]);

  const renderLeaf = useCallback((props: RenderLeafProps) => <Leaf {...props} />, []);
  const renderElement = useCallback((props: RenderElementProps) => <Element {...props} />, []);

  const isMarkActive = (format: keyof CustomText) => {
    const marks = Editor.marks(editor);
    return marks ? (marks as any)[format] === true : false;
  };

  const toggleMark = (format: keyof CustomText) => {
    const isActive = isMarkActive(format);
    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  };

  const isBlockActive = (format: string) => {
    const { selection } = editor;
    if (!selection) return false;

    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && (n as any).type === format,
      })
    );

    return !!match;
  };

  const toggleBlock = (format: string) => {
    const isActive = isBlockActive(format);
    const isList = ['numbered-list', 'bulleted-list'].includes(format);

    Transforms.unwrapNodes(editor, {
      match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && ['numbered-list', 'bulleted-list'].includes((n as any).type),
      split: true,
    });

    const newProperties: Partial<CustomElement> = {
      type: isActive ? 'paragraph' : (isList ? 'list-item' : format) as any,
    };
    Transforms.setNodes<SlateElement>(editor, newProperties);

    if (!isActive && isList) {
      const block = { type: format, children: [] } as any;
      Transforms.wrapNodes(editor, block);
    }
  };

  const setAlignment = (align: string) => {
    Transforms.setNodes(
      editor,
      { align } as any,
      { match: n => !Editor.isEditor(n) && SlateElement.isElement(n) }
    );
  };

  const insertDivider = () => {
    const divider: DividerElement = {
      type: 'divider',
      children: [{ text: '' }],
    };
    Transforms.insertNodes(editor, divider);
    Transforms.insertNodes(editor, {
      type: 'paragraph',
      children: [{ text: '' }],
    } as ParagraphElement);
  };

  const ToolbarButton = ({ 
    format, 
    icon: Icon, 
    title, 
    onToggle 
  }: { 
    format?: string; 
    icon: any; 
    title: string; 
    onToggle: () => void;
  }) => {
    const isActive = format ? (format.includes('-') ? isBlockActive(format) : isMarkActive(format as keyof CustomText)) : false;
    
    return (
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          onToggle();
        }}
        className={`p-2 hover:bg-gray-200 rounded transition-colors ${isActive ? 'bg-gray-300' : ''}`}
        title={title}
      >
        <Icon className="w-4 h-4 text-gray-700" />
      </button>
    );
  };

  return (
    <div className={className}>
      <Slate editor={editor} initialValue={initialValue} onChange={handleChange}>
        <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-opacity-20">
          <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200">
            <ToolbarButton format="bold" icon={Bold} title="Bold (Ctrl+B)" onToggle={() => toggleMark('bold')} />
            <ToolbarButton format="italic" icon={Italic} title="Italic (Ctrl+I)" onToggle={() => toggleMark('italic')} />
            <ToolbarButton format="underline" icon={Underline} title="Underline (Ctrl+U)" onToggle={() => toggleMark('underline')} />
            
            <div className="w-px h-6 bg-gray-300 mx-1" />
            
            <ToolbarButton format="heading-one" icon={Heading1} title="Heading 1" onToggle={() => toggleBlock('heading-one')} />
            <ToolbarButton format="heading-two" icon={Heading2} title="Heading 2" onToggle={() => toggleBlock('heading-two')} />
            <ToolbarButton format="block-quote" icon={Quote} title="Quote" onToggle={() => toggleBlock('block-quote')} />
            
            <div className="w-px h-6 bg-gray-300 mx-1" />
            
            <ToolbarButton format="numbered-list" icon={ListOrdered} title="Numbered List" onToggle={() => toggleBlock('numbered-list')} />
            <ToolbarButton format="bulleted-list" icon={List} title="Bulleted List" onToggle={() => toggleBlock('bulleted-list')} />
            
            <div className="w-px h-6 bg-gray-300 mx-1" />
            
            <ToolbarButton icon={AlignLeft} title="Align Left" onToggle={() => setAlignment('left')} />
            <ToolbarButton icon={AlignCenter} title="Align Center" onToggle={() => setAlignment('center')} />
            <ToolbarButton icon={AlignRight} title="Align Right" onToggle={() => setAlignment('right')} />
            <ToolbarButton icon={AlignJustify} title="Align Justify" onToggle={() => setAlignment('justify')} />
            
            <div className="w-px h-6 bg-gray-300 mx-1" />
            
            <ToolbarButton icon={Minus} title="Divider" onToggle={insertDivider} />
          </div>
          
          <Editable
            renderLeaf={renderLeaf}
            renderElement={renderElement}
            placeholder={placeholder}
            className="px-4 py-3 text-base focus:outline-none"
            style={{
              minHeight: '120px',
              overflow: 'visible',
            }}
            onKeyDown={(event) => {
              if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                  case 'b': {
                    event.preventDefault();
                    toggleMark('bold');
                    break;
                  }
                  case 'i': {
                    event.preventDefault();
                    toggleMark('italic');
                    break;
                  }
                  case 'u': {
                    event.preventDefault();
                    toggleMark('underline');
                    break;
                  }
                }
              }
            }}
          />
        </div>
      </Slate>
    </div>
  );
}
