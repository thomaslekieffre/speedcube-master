"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Type,
  Eye,
  EyeOff,
  RotateCcw,
  Zap,
  Box,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showPreview?: boolean;
  showCubingNotation?: boolean;
  onCubingNotationChange?: (notation: string) => void;
  cubingNotationValue?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Écrivez votre contenu en Markdown...",
  className,
  showPreview = true,
  showCubingNotation = false,
  onCubingNotationChange,
  cubingNotationValue = "",
}: MarkdownEditorProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showCubingPanel, setShowCubingPanel] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fonctions d'insertion de formatage
  const insertText = (before: string, after: string = "") => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end);

    onChange(newText);

    // Restaurer la sélection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const insertAtCursor = (text: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const newText = value.substring(0, start) + text + value.substring(start);

    onChange(newText);

    // Placer le curseur après l'insertion
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  // Actions de formatage
  const formatBold = () => insertText("**", "**");
  const formatItalic = () => insertText("*", "*");
  const formatUnderline = () => insertText("<u>", "</u>");
  const formatHeading1 = () => insertAtCursor("# ");
  const formatHeading2 = () => insertAtCursor("## ");
  const formatHeading3 = () => insertAtCursor("### ");
  const formatSeparator = () => insertAtCursor("\n---\n");
  const formatLargeText = () =>
    insertText("<span style='font-size: 1.2em;'>", "</span>");
  const formatSmallText = () =>
    insertText("<span style='font-size: 0.9em;'>", "</span>");

  // Notation cubing
  const insertCubingMove = (move: string) => {
    if (onCubingNotationChange) {
      onCubingNotationChange(cubingNotationValue + " " + move);
    }
  };

  const clearCubingNotation = () => {
    if (onCubingNotationChange) {
      onCubingNotationChange("");
    }
  };

  // Rendu du Markdown
  const renderMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/<u>(.*?)<\/u>/g, "<u>$1</u>")
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mb-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mb-2">$1</h3>')
      .replace(/^---$/gm, '<hr class="my-4 border-border" />')
      .replace(
        /<span style='font-size: 1\.2em;'>(.*?)<\/span>/g,
        '<span class="text-lg">$1</span>'
      )
      .replace(
        /<span style='font-size: 0\.9em;'>(.*?)<\/span>/g,
        '<span class="text-sm">$1</span>'
      )
      .replace(/\n/g, "<br />");
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Barre d'outils */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Éditeur Markdown
            </CardTitle>
            <div className="flex items-center gap-2">
              {showPreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className="h-8 px-2"
                >
                  {isPreviewMode ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-1" />
                      Éditer
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-1" />
                      Aperçu
                    </>
                  )}
                </Button>
              )}
              {showCubingNotation && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCubingPanel(!showCubingPanel)}
                  className="h-8 px-2"
                >
                  <Box className="h-4 w-4 mr-1" />
                  Notation
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Boutons de formatage */}
          <div className="flex flex-wrap items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={formatBold}
              className="h-8 px-2"
              title="Gras"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={formatItalic}
              className="h-8 px-2"
              title="Italique"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={formatUnderline}
              className="h-8 px-2"
              title="Souligné"
            >
              <Underline className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={formatHeading1}
              className="h-8 px-2"
              title="Titre 1"
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={formatHeading2}
              className="h-8 px-2"
              title="Titre 2"
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={formatHeading3}
              className="h-8 px-2"
              title="Titre 3"
            >
              <Heading3 className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={formatLargeText}
              className="h-8 px-2"
              title="Texte plus grand"
            >
              <Type className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={formatSmallText}
              className="h-8 px-2"
              title="Texte plus petit"
            >
              <Type className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={formatSeparator}
              className="h-8 px-2"
              title="Séparateur"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>

          {/* Panneau de notation cubing */}
          {showCubingNotation && showCubingPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border rounded-lg p-4 bg-muted/50"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Notation Cubing</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearCubingNotation}
                  className="h-6 px-2"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Effacer
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {["R", "L", "U", "D", "F", "B"].map((face) => (
                    <Button
                      key={face}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertCubingMove(face)}
                      className="h-6 px-2 text-xs"
                    >
                      {face}
                    </Button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {["R'", "L'", "U'", "D'", "F'", "B'"].map((face) => (
                    <Button
                      key={face}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertCubingMove(face)}
                      className="h-6 px-2 text-xs"
                    >
                      {face}
                    </Button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {["R2", "L2", "U2", "D2", "F2", "B2"].map((face) => (
                    <Button
                      key={face}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertCubingMove(face)}
                      className="h-6 px-2 text-xs"
                    >
                      {face}
                    </Button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {["x", "y", "z", "x'", "y'", "z'", "x2", "y2", "z2"].map(
                    (move) => (
                      <Button
                        key={move}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertCubingMove(move)}
                        className="h-6 px-2 text-xs"
                      >
                        {move}
                      </Button>
                    )
                  )}
                </div>
              </div>

              {cubingNotationValue && (
                <div className="mt-3 p-2 bg-background border rounded text-sm font-mono">
                  {cubingNotationValue}
                </div>
              )}
            </motion.div>
          )}

          {/* Zone d'édition/Aperçu */}
          {isPreviewMode ? (
            <div className="min-h-[200px] p-4 border rounded-lg bg-background">
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
              />
            </div>
          ) : (
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="min-h-[200px] font-mono text-sm"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
