"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TypingEffectProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  highlightWords?: string[];
  highlightColor?: string;
}

export function TypingEffect({ 
  text, 
  speed = 100, 
  delay = 0,
  className = "",
  highlightWords = [],
  highlightColor = "text-primary"
}: TypingEffectProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    // Délai initial avant de commencer
    const startTimer = setTimeout(() => {
      setIsStarted(true);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!isStarted) return;

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed, isStarted]);

  // Fonction pour appliquer les highlights
  const renderTextWithHighlights = (text: string) => {
    if (highlightWords.length === 0) {
      return text;
    }

    const words = text.split(" ");
    return words.map((word, index) => {
      const isHighlighted = highlightWords.some(highlight => 
        word.toLowerCase().includes(highlight.toLowerCase())
      );
      
      return (
        <span key={index}>
          {isHighlighted ? (
            <span className={highlightColor}>{word}</span>
          ) : (
            word
          )}
          {index < words.length - 1 && " "}
        </span>
      );
    });
  };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {renderTextWithHighlights(displayedText)}
      {isStarted && currentIndex < text.length && (
        <motion.span
          className="inline-block w-0.5 h-6 bg-foreground ml-1"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
