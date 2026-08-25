import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown2, InfoCircle } from "iconsax-react";
import { ContainerScroll } from "./ui/container-scroll-animation";
import { sounds } from "../utils/soundEffects";

const faqData = [
  {
    question: "Why did I create this project?",
    answer: (
      <>
        <span className="text-cyan-500 font-semibold">I created this project</span> to build a bridge for open, barrier-free communication. It allows you to ask me anything you want—whether it's feedback, curiosity, or general inquiries—giving you a dedicated space to share your thoughts.
      </>
    ),
  },
  {
    question: "Is it safe to send questions anonymously?",
    answer: (
      <>
        <span className="text-cyan-500 font-semibold">Yes, absolutely.</span> Your anonymity is fully preserved. The system is designed to store questions without tracking your identity, device information, or IP address. Your privacy is guaranteed.
      </>
    ),
  },
  {
    question: "What kind of questions can I ask?",
    answer: (
      <>
        <span className="text-cyan-500 font-semibold">You can ask about anything!</span> From career advice, coding tips, and tech stacks, to my personal life, opinions, hobbies, and general thoughts. Friendly banter and casual questions are always welcome.
      </>
    ),
  },
  {
    question: "How and when will my questions be answered?",
    answer: (
      <>
        <span className="text-cyan-500 font-semibold">Once a question is submitted,</span> I will review it in my admin workspace. I will respond to public questions directly on this page, and they will display in real-time under the 'Recently Asked' section.
      </>
    ),
  },
  {
    question: "Can anyone see my anonymous question?",
    answer: (
      <>
        <span className="text-cyan-500 font-semibold">Only after I review and answer it</span> will it be visible in the public feed. Until then, it is kept private so I can review it for safety and moderation.
      </>
    ),
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    sounds.playClick();
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full mt-4">
      <ContainerScroll
        titleComponent={
          <div className="flex items-center justify-center mb-6 w-full px-2">
            <h2 className="flex items-center justify-center gap-1.5 sm:gap-2.5 text-[18px] min-[360px]:text-[20px] min-[390px]:text-[22px] sm:text-3xl md:text-4xl lg:text-5xl tracking-tight text-[color:var(--app-text)] whitespace-nowrap font-bold">
              <InfoCircle className="text-cyan-500 w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10 animate-pulse shrink-0" />
              <span>
                Frequently Asked <span className="text-cyan-500">Questions</span>
              </span>
            </h2>
          </div>
        }
      >
        <div className="flex flex-col gap-3 p-1">
          {faqData.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="glass-subpane rounded-2xl overflow-hidden transition-all duration-300 hover:border-cyan-500/20"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between p-4 text-left text-sm sm:text-base text-[color:var(--app-text)] transition-colors hover:text-cyan-500 focus:outline-none mali-semibold"
                >
                  <span>{item.question}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-cyan-500 ml-3 shrink-0"
                  >
                    <ArrowDown2 size={20} />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="p-4 pt-0 text-xs sm:text-sm text-[color:var(--app-text)] opacity-85 leading-relaxed border-t border-slate-200/30 dark:border-white/5 whitespace-pre-line mali-regular">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </ContainerScroll>
    </div>
  );
}
