import React from "react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

interface FooterLink {
  label: string;
  href: string;
}

interface SocialLink {
  icon: React.ReactNode;
  href: string;
  label: string;
}

interface FooterProps {
  brandName?: string;
  brandDescription?: string;
  socialLinks?: SocialLink[];
  navLinks?: FooterLink[];
  creatorName?: string;
  creatorUrl?: string;
  brandIcon?: React.ReactNode;
  className?: string;
  onSilaClick?: () => void;
}

export const Footer = ({
  brandName = "YourBrand",
  brandDescription = "Your description here",
  socialLinks = [],
  navLinks = [],
  brandIcon,
  className,
  onSilaClick,
}: FooterProps) => {

  const renderClickableText = (text: string, buttonClassName: string) => {
    if (!onSilaClick) return <span>{text}</span>;
    const parts = text.split(/(Sila)/i);
    return parts.map((part, i) => {
      if (part.toLowerCase() === "sila") {
        return (
          <button
            key={i}
            onClick={onSilaClick}
            className={cn(
              "focus:outline-none cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 hover:from-purple-500 hover:to-cyan-400",
              buttonClassName
            )}
          >
            {part}
          </button>
        );
      }
      return <span key={i} className="text-inherit">{part}</span>;
    });
  };

  return (
    <section className={cn("relative w-full mt-0 overflow-hidden", className)}>
      <footer className="border-t bg-background mt-4 relative">
        {/* Colorful top border strip */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-cyan-400 via-pink-500 via-purple-500 to-emerald-400" />

        <div className="max-w-7xl flex flex-col justify-between mx-auto relative p-4 py-6 md:py-8">
          <div className="flex flex-col mb-12 sm:mb-20 md:mb-0 w-full">
            <div className="w-full flex flex-col items-center">
              <div className="space-y-2 flex flex-col items-center flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-extrabold racing-sans-one-regular tracking-wider">
                    {renderClickableText(brandName, "font-extrabold border-b border-dashed border-purple-500/40 pb-0.5")}
                  </span>
                </div>
                <p className="text-muted-foreground text-center w-full max-w-sm sm:w-96 px-4 sm:px-0 mali-medium text-sm sm:text-base">
                  {brandDescription}
                </p>
              </div>

              {socialLinks.length > 0 && (
                <div className="flex mb-8 mt-5 gap-4">
                  {socialLinks.map((link, index) => {
                    let hoverClass = "hover:bg-slate-800 hover:text-white hover:shadow-[0_0_12px_rgba(255,255,255,0.25)] dark:hover:bg-white dark:hover:text-slate-900";
                    if (link.label.toLowerCase() === "instagram") {
                      hoverClass = "hover:bg-gradient-to-tr hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 hover:text-white hover:shadow-[0_0_12px_rgba(236,72,153,0.4)]";
                    } else if (link.label.toLowerCase() === "facebook") {
                      hoverClass = "hover:bg-blue-600 hover:text-white hover:shadow-[0_0_12px_rgba(59,130,246,0.4)]";
                    }
                    return (
                      <a
                        key={index}
                        href={link.href}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center bg-[color:var(--icon-chip)] text-[color:var(--app-text)] transition-all duration-300 active:scale-95",
                          hoverClass
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className="w-5 h-5 flex items-center justify-center hover:scale-110 duration-300">
                          {link.icon}
                        </div>
                        <span className="sr-only">{link.label}</span>
                      </a>
                    );
                  })}
                </div>
              )}

              {navLinks.length > 0 && (
                <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-muted-foreground max-w-full px-4 mali-semibold">
                  {navLinks.map((link, index) => {
                    if (link.href === "#admin" && onSilaClick) {
                      return (
                        <button
                          key={index}
                          type="button"
                          className="hover:text-foreground duration-300 hover:font-bold focus:outline-none cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            onSilaClick();
                          }}
                        >
                          {link.label}
                        </button>
                      );
                    }
                    const isExternal = link.href.startsWith("http") || link.href.startsWith("mailto");
                    return isExternal ? (
                      <a
                        key={index}
                        className="hover:text-foreground duration-300 hover:font-bold"
                        href={link.href}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        key={index}
                        className="hover:text-foreground duration-300 hover:font-bold"
                        to={link.href}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 md:mt-5 flex items-center justify-center w-full px-2 text-center">
            <p className="text-[10px] min-[360px]:text-xs sm:text-sm md:text-base text-muted-foreground flex flex-row items-center justify-center gap-1.5 sm:gap-2.5 whitespace-nowrap mali-regular">
              <span>
                ©{new Date().getFullYear()} {renderClickableText(brandName, "font-bold")}. All rights reserved.
              </span>
            </p>
          </div>
        </div>

        {/* Large background text - FIXED */}
        <div 
          className="racing-sans-one-regular bg-gradient-to-r from-cyan-500/10 via-pink-500/10 via-purple-500/10 to-transparent bg-clip-text text-transparent leading-none absolute left-1/2 -translate-x-1/2 bottom-2 md:bottom-1 font-extrabold tracking-widest pointer-events-none select-none text-center px-4"
          style={{
            fontSize: 'clamp(2rem, 8vw, 6rem)',
            maxWidth: '95vw'
          }}
        >
          {brandName.toUpperCase()}
        </div>

        {/* Bottom logo */}
        {brandIcon && (
          <div 
            onClick={onSilaClick}
            className={cn(
              "absolute hover:border-foreground duration-400 drop-shadow-[0_0px_20px_rgba(0,0,0,0.5)] dark:drop-shadow-[0_0px_20px_rgba(255,255,255,0.3)] bottom-24 md:bottom-20 backdrop-blur-sm rounded-3xl bg-background/60 left-1/2 border-2 border-border flex items-center justify-center p-3 -translate-x-1/2 z-10",
              onSilaClick ? "cursor-pointer" : ""
            )}
          >
            <div className="w-12 sm:w-16 md:w-24 h-12 sm:h-16 md:h-24 bg-gradient-to-br from-foreground to-foreground/80 rounded-2xl flex items-center justify-center shadow-lg">
              {brandIcon}
            </div>
          </div>
        )}

        {/* Bottom line */}
        {brandIcon && (
          <div className="absolute bottom-32 sm:bottom-34 backdrop-blur-sm h-1 bg-gradient-to-r from-transparent via-border to-transparent w-full left-1/2 -translate-x-1/2"></div>
        )}

        {/* Bottom shadow */}
        {brandIcon && (
          <div className="bg-gradient-to-t from-background via-background/80 blur-[1em] to-background/40 absolute bottom-28 w-full h-24"></div>
        )}
      </footer>
    </section>
  );
};
