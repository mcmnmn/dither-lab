import { useState, useCallback, useRef, type ReactNode, type DragEvent } from 'react';
import { isAcceptedMedia, MEDIA_ACCEPT } from '../../utils/media-io';

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  children: ReactNode;
  className?: string;
}

export function DropZone({ onFiles, accept = MEDIA_ACCEPT, multiple = false, children, className = '' }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(isAcceptedMedia);
    if (files.length > 0) onFiles(multiple ? files : [files[0]]);
  }, [onFiles, multiple]);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) onFiles(multiple ? files : [files[0]]);
    e.target.value = '';
  }, [onFiles, multiple]);

  return (
    <div
      className={`${className} ${isDragging ? 'ring-2 ring-(--color-accent) bg-(--color-accent)/10' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={handleInputChange}
      />
      {children}
    </div>
  );
}
