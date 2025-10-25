import { GameDataI } from "@/types/Course";
import Modal from "../Modal/Modal";
import { useExplanation } from "@/hooks/courses/useExplanation";
import Loading from "../loader/Loading";
import { useEffect, useState } from "react";

interface ShowHelpProps {
  question: string;
  answer: string | number;
  course: GameDataI;
  onClose: () => void;
  isOpen: boolean;
}

export const ShowHelp = ({
  question,
  course,
  answer,
  onClose,
  isOpen,
}: ShowHelpProps) => {
  const { data: explanation, isLoading } = useExplanation(course, question);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  // Function to parse and format markdown content
  const formatContent = (content: string) => {
    if (!content) return <p>No explanation available.</p>;

    // Split content into lines for processing
    return content.split("\n").map((line, index) => {
      // Handle headings (# h1, ## h2, ### h3)
      if (line.startsWith("# ")) {
        return (
          <h1 key={index} className="text-4xl font-bold mt-4 mb-4 text-primary-600">
            {line.substring(2)}
          </h1>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={index} className="text-3xl font-bold mt-4 mb-4 text-primary-500">
            {line.substring(3)}
          </h2>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <h3 key={index} className="text-2xl font-bold mt-2 mb-2 text-primary-400">
            {line.substring(4)}
          </h3>
        );
      }

      // Handle code blocks
      if (line.startsWith("```") && line.endsWith("```")) {
        return (
          <pre
            key={index}
            className="bg-gray-900 text-white p-4 rounded-md my-4 overflow-x-auto font-mono text-xl"
          >
            <code>{line.replace(/```/g, "").trim()}</code>
          </pre>
        );
      }

      // Handle bullet points
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <li key={index} className="ml-8 mb-3 list-disc text-xl">
            {parseInlineFormatting(line.substring(2))}
          </li>
        );
      }

      // Handle numbered lists
      const numberedListMatch = line.match(/^\d+\.\s(.+)$/);
      if (numberedListMatch) {
        return (
          <li key={index} className="ml-8 mb-3 list-decimal text-xl">
            {parseInlineFormatting(numberedListMatch[1])}
          </li>
        );
      }

      // Handle empty lines
      if (line.trim() === "") {
        return <div key={index} className="h-6"></div>;
      }

      // Default paragraph with inline formatting
      return (
        <p key={index} className="mb-4 text-2xl">
          {parseInlineFormatting(line)}
        </p>
      );
    });
  };

  // Function to parse inline formatting (bold, links, etc.)
  const parseInlineFormatting = (text: string) => {
    // Handle bold text (**text**)
    const boldPattern = /\*\*(.*?)\*\*/g;
    let boldMatch;
    let contentCopy = text;

    // First extract links to prevent conflicts
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links: { text: string; url: string; startPos: number; endPos: number }[] = [];
    let linkMatch;
    
    while ((linkMatch = linkPattern.exec(contentCopy)) !== null) {
      links.push({
        text: linkMatch[1],
        url: linkMatch[2],
        startPos: linkMatch.index,
        endPos: linkMatch.index + linkMatch[0].length
      });
    }

    // Replace link placeholders in the text
    links.forEach((link, i) => {
      contentCopy = contentCopy.replace(
        `[${link.text}](${link.url})`,
        `__LINK${i}__`
      );
    });

    // Process bold text
    const fragments = [];
    let currentPos = 0;

    while ((boldMatch = boldPattern.exec(contentCopy)) !== null) {
      // Add text before the bold
      if (boldMatch.index > currentPos) {
        fragments.push({
          type: 'text',
          content: contentCopy.substring(currentPos, boldMatch.index)
        });
      }

      // Add the bold text
      fragments.push({
        type: 'bold',
        content: boldMatch[1]
      });

      currentPos = boldMatch.index + boldMatch[0].length;
    }

    // Add remaining text
    if (currentPos < contentCopy.length) {
      fragments.push({
        type: 'text',
        content: contentCopy.substring(currentPos)
      });
    }

    // Restore links
    const finalElements = fragments.map((fragment, fragIndex) => {
      if (fragment.type === 'bold') {
        return <strong key={`bold-${fragIndex}`} className="font-bold">{fragment.content}</strong>;
      } else {
        // Check for link placeholders in this text fragment
        let textContent = fragment.content;
        const elements = [];
        
        for (let i = 0; i < links.length; i++) {
          const placeholder = `__LINK${i}__`;
          const placeholderPos = textContent.indexOf(placeholder);
          
          if (placeholderPos !== -1) {
            // Add text before the link
            if (placeholderPos > 0) {
              elements.push(textContent.substring(0, placeholderPos));
            }
            
            // Add the link
            elements.push(
              <a 
                key={`link-${i}`}
                href={links[i].url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline hover:text-blue-700 cursor-pointer transition-colors"
              >
                {links[i].text}
              </a>
            );
            
            // Update the text content
            textContent = textContent.substring(placeholderPos + placeholder.length);
          }
        }
        
        // Add any remaining text
        if (textContent.length > 0) {
          elements.push(textContent);
        }
        
        return <span key={`text-${fragIndex}`}>{elements}</span>;
      }
    });

    return finalElements;
  };

  return (
    <Modal title={"Help & Explanations"} isOpen={isOpen} onClose={onClose} size="full" showCloseButton={true}>
      <div className="bg-white rounded-3xl p-8 w-full max-h-[75vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[50vh] relative">
            <Loading
              overlay={false}
              fullScreen={false}
              text="Loading Explanations..."
            />
          </div>
        ) : explanation ? (
          <div className="mb-8">
            <div className="flex flex-col gap-3 mb-8 bg-primary-50 p-6 rounded-2xl border-l-8 border-primary-400">
              {question !== "" && (
                <div className="text-2xl mb-2">
                  <span className="font-bold text-primary-600">Question:</span>
                  <div className="mt-2 ml-4">{question}</div>
                </div>
              )}
              <div className="text-2xl">
                <span className="font-bold text-primary-600">Correct answer:</span>
                <div className="mt-2 ml-4 text-green-600 font-semibold">{answer}</div>
              </div>
            </div>
            <div className="border-t-4 border-primary-200 pt-6">
              <p className="font-bold text-3xl mb-4 text-primary-500">Explanation:</p>
              <div className="bg-blue-50 p-8 rounded-2xl shadow-sm">
                {formatContent(explanation)}
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <div className="flex flex-col gap-3 mb-8 bg-primary-50 p-6 rounded-2xl border-l-8 border-primary-400">
              <div className="text-2xl mb-2">
                <span className="font-bold text-primary-600">Problem:</span>
                <div className="mt-2 ml-4">{question}</div>
              </div>
              <div className="text-2xl">
                <span className="font-bold text-primary-600">Correct answer:</span>
                <div className="mt-2 ml-4 text-green-600 font-semibold">{answer}</div>
              </div>
            </div>
            <div className="border-t-4 border-primary-200 pt-6">
              <p className="font-bold text-3xl mb-4 text-primary-500">Explanation:</p>
              <div className="bg-blue-50 p-8 rounded-2xl">
                <p className="text-xl">I&apos;m sorry, I couldn&apos;t get explanations!</p>
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-center mt-8">
          <button
            onClick={onClose}
            className="bg-primary-400 text-white text-3xl py-5 px-10 rounded-full hover:bg-primary-300 transition-all transform hover:scale-105 shadow-lg"
          >
            Continue Learning
          </button>
        </div>
      </div>
    </Modal>
  );
};