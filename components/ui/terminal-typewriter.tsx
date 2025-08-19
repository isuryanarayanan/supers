'use client';

import { useState, useEffect, useRef } from 'react';

interface QAItem {
  question: string;
  answer: string;
  delay?: number; // Delay before starting this Q&A pair
}

interface TerminalTypewriterProps {
  qaItems?: QAItem[]; // Make optional
  typeSpeed?: number;
  questionDelay?: number;
  answerDelay?: number;
  className?: string;
}

export function TerminalTypewriter({ 
  qaItems = [], 
  typeSpeed = 25, 
  questionDelay = 1000,
  answerDelay = 500,
  className = ''
}: TerminalTypewriterProps) {
  const [displayedItems, setDisplayedItems] = useState<Array<{
    question: string;
    answer: string;
    questionComplete: boolean;
    answerComplete: boolean;
  }>>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'waiting' | 'typing-question' | 'typing-answer'>('waiting');
  const [currentText, setCurrentText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const qaItemsRef = useRef<QAItem[]>([]);
  
  // Update items ref when qaItems change
  useEffect(() => {
    // Ensure qaItems is always an array
    const items = qaItems || [];
    
    const hasChanged = items.length !== qaItemsRef.current.length || 
      items.some((item, index) => 
        item.question !== qaItemsRef.current[index]?.question ||
        item.answer !== qaItemsRef.current[index]?.answer
      );
    
    if (hasChanged) {
      qaItemsRef.current = items;
      // Reset state
      setDisplayedItems([]);
      setCurrentItemIndex(0);
      setCurrentPhase('waiting');
      setCurrentText('');
      setIsComplete(false);
    }
  }, [qaItems]);

  // Main animation logic
  useEffect(() => {
    // If no items provided, just show the final cursor
    if (!qaItemsRef.current || qaItemsRef.current.length === 0) {
      setIsComplete(true);
      return;
    }

    if (isComplete || currentItemIndex >= qaItemsRef.current.length) {
      if (!isComplete) setIsComplete(true);
      return;
    }

    const currentItem = qaItemsRef.current[currentItemIndex];
    
    if (currentPhase === 'waiting') {
      const delay = currentItem.delay || (currentItemIndex === 0 ? 0 : questionDelay);
      const timeout = setTimeout(() => {
        setCurrentPhase('typing-question');
        setCurrentText('');
      }, delay);
      return () => clearTimeout(timeout);
    }

    if (currentPhase === 'typing-question') {
      const targetText = currentItem.question;
      if (currentText.length < targetText.length) {
        const timeout = setTimeout(() => {
          setCurrentText(targetText.slice(0, currentText.length + 1));
        }, typeSpeed);
        return () => clearTimeout(timeout);
      } else {
        // Question complete, move to answer after delay
        const timeout = setTimeout(() => {
          // Don't add to displayedItems yet - let currentlyTyping handle the display
          setCurrentPhase('typing-answer');
          setCurrentText('');
        }, answerDelay);
        return () => clearTimeout(timeout);
      }
    }

    if (currentPhase === 'typing-answer') {
      const targetText = currentItem.answer;
      if (currentText.length < targetText.length) {
        const timeout = setTimeout(() => {
          const newText = targetText.slice(0, currentText.length + 1);
          setCurrentText(newText);
          // Don't update displayedItems during typing - let the currentlyTyping handle it
        }, typeSpeed);
        return () => clearTimeout(timeout);
      } else {
        // Answer complete, move to next item
        setDisplayedItems(prev => [
          ...prev,
          {
            question: currentItem.question,
            answer: currentItem.answer,
            questionComplete: true,
            answerComplete: true
          }
        ]);
        setCurrentItemIndex(prev => prev + 1);
        setCurrentPhase('waiting');
        setCurrentText('');
      }
    }
  }, [currentPhase, currentText, currentItemIndex, typeSpeed, questionDelay, answerDelay, isComplete]);

  // Cursor blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const getCurrentlyTyping = () => {
    // If no items or complete, don't show typing state
    if (isComplete || !qaItemsRef.current || qaItemsRef.current.length === 0 || currentItemIndex >= qaItemsRef.current.length) {
      return null;
    }
    
    if (currentPhase === 'typing-question') {
      return { type: 'question', text: currentText };
    }
    if (currentPhase === 'typing-answer') {
      return { type: 'answer', text: currentText };
    }
    return null;
  };

  const currentlyTyping = getCurrentlyTyping();

  return (
    <div className={`text-left text-xs ${className}`} style={{ 
        fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", "SF Mono", "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "Courier New", monospace',
        fontWeight: '400',
        letterSpacing: '0.025em',
        fontFeatureSettings: '"liga" 1, "calt" 1, "kern" 1',
        fontVariantLigatures: 'contextual'
      }}>
      
      {/* Completed Q&A pairs */}
      {displayedItems.filter(item => item.answerComplete).map((item, index) => (
        <div key={index} className="mb-6">
          {/* Question */}
          <div className="flex items-start mb-2">
            <span className="text-green-400 leading-tight font-semibold text-xs bg-black/70 px-2 py-1">{item.question}</span>
          </div>
          {/* Answer */}
          {item.answer && (
            <div className="mb-1">
              <span className="text-white leading-tight whitespace-pre-wrap font-normal bg-black/70 px-2 py-1 inline-block">
                {item.answer}
              </span>
            </div>
          )}
        </div>
      ))}

      {/* Currently typing */}
      {currentlyTyping && (
        <div className="mb-6">
          {currentlyTyping.type === 'question' && (
            <div className="flex items-start">
              <span className="text-green-400 leading-tight font-semibold text-xs bg-black/70 px-2 py-1">
                {currentlyTyping.text}
                <span className={`inline-block w-1 h-3 bg-green-400 ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'}`}>
                  ▋
                </span>
              </span>
            </div>
          )}
          {currentlyTyping.type === 'answer' && (
            <>
              <div className="flex items-start mb-2">
                <span className="text-green-400 leading-tight font-semibold text-xs bg-black/70 px-2 py-1">{qaItemsRef.current[currentItemIndex]?.question}</span>
              </div>
              <div className="mb-1">
                <span className="text-white leading-tight whitespace-pre-wrap font-normal bg-black/70 px-2 py-1 inline-block">
                  {currentlyTyping.text}
                  <span className={`inline-block w-1 h-3 bg-white ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'}`}>
                    ▋
                  </span>
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Final cursor when complete */}
      {isComplete && qaItemsRef.current && qaItemsRef.current.length > 0 && (
        <div className="flex items-start">
          <span className={`inline-block w-1 h-3 bg-black ${showCursor ? 'opacity-100' : 'opacity-0'}`}>
            ▋
          </span>
        </div>
      )}

      {/* Show ready state when no items */}
      {(!qaItemsRef.current || qaItemsRef.current.length === 0) && (
        <div className="flex items-start">
          <span className="text-black text-xs font-semibold italic">Ready for Q&A data...</span>
        </div>
      )}
    </div>
  );
}
