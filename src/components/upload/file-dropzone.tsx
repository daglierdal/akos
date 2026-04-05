"use client";

import { useMemo, useRef, useState } from "react";
import { FileUp, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ACCEPTED_EXTENSIONS = [
  ".pdf",
  ".dwg",
  ".dxf",
  ".skp",
  ".xlsx",
  ".docx",
  ".jpg",
  ".jpeg",
  ".png",
  ".zip",
];

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;

export interface FileDropzoneProps {
  disabled?: boolean;
  onFilesChange?: (files: File[]) => void;
  className?: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isAcceptedFile(file: File) {
  const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
  return ACCEPTED_EXTENSIONS.includes(extension) && file.size <= MAX_FILE_SIZE_BYTES;
}

export function FileDropzone({
  disabled = false,
  onFilesChange,
  className,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const accept = useMemo(() => ACCEPTED_EXTENSIONS.join(","), []);

  function commitFiles(nextFiles: File[]) {
    const unique = new Map<string, File>();

    for (const file of [...files, ...nextFiles]) {
      unique.set(`${file.name}-${file.size}-${file.lastModified}`, file);
    }

    const accepted: File[] = [];
    const nextErrors: string[] = [];

    for (const file of unique.values()) {
      if (!isAcceptedFile(file)) {
        nextErrors.push(
          `${file.name}: desteklenmeyen format veya 100MB limitini asiyor.`
        );
        continue;
      }

      accepted.push(file);
    }

    setFiles(accepted);
    setErrors(nextErrors);
    onFilesChange?.(accepted);
  }

  function handleNativeFiles(fileList: FileList | null) {
    if (!fileList || disabled) {
      return;
    }

    commitFiles(Array.from(fileList));
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (!disabled && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) {
            setIsDragging(true);
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          if (event.currentTarget.contains(event.relatedTarget as Node)) {
            return;
          }
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleNativeFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-8 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/30 hover:bg-muted/50",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        <div className="mb-4 rounded-full border border-border bg-background p-3">
          {isDragging ? <Upload className="size-6" /> : <FileUp className="size-6" />}
        </div>
        <p className="text-base font-medium">Dosyalari surukleyip birakin</p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          PDF, DWG, DXF, SKP, XLSX, DOCX, JPG, PNG ve ZIP. Coklu secim desteklenir,
          dosya basi en fazla 100MB.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-5"
          disabled={disabled}
        >
          Dosya Sec
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          disabled={disabled}
          className="hidden"
          onChange={(event) => handleNativeFiles(event.target.files)}
        />
      </div>

      {errors.length > 0 ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      ) : null}

      {files.length > 0 ? (
        <div className="space-y-2 rounded-xl border border-border bg-background p-3">
          {files.map((file) => (
            <div
              key={`${file.name}-${file.size}-${file.lastModified}`}
              className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={(event) => {
                  event.stopPropagation();
                  const nextFiles = files.filter((item) => item !== file);
                  setFiles(nextFiles);
                  onFilesChange?.(nextFiles);
                }}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
