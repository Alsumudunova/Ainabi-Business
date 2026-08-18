import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { GuideSection } from "../data/guideSections";
import "./GuideAccordion.css";

interface GuideAccordionProps {
  sections: GuideSection[];
}

/** Click-to-expand "how do I use X" list, shared by the Landing page and the in-app Support page. */
export function GuideAccordion({ sections }: GuideAccordionProps) {
  const [openTitle, setOpenTitle] = useState<string | null>(null);

  return (
    <div className="guide-accordion">
      {sections.map((section) => {
        const isOpen = openTitle === section.title;
        return (
          <div className={`guide-item ${isOpen ? "open" : ""}`} key={section.title}>
            <button className="guide-header" onClick={() => setOpenTitle(isOpen ? null : section.title)}>
              <span className="guide-icon">
                <section.icon size={18} />
              </span>
              <span className="guide-title">{section.title}</span>
              <ChevronDown size={18} className="guide-chevron" />
            </button>
            {isOpen && (
              <ol className="guide-steps">
                {section.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            )}
          </div>
        );
      })}
    </div>
  );
}
