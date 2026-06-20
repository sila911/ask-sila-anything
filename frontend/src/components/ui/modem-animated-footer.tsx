import React from "react";
import { Link } from "react-router-dom";
import {
  NotepadTextDashed,
} from "lucide-react";
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
  creatorName,
  creatorUrl,
  brandIcon,
  className,
  onSilaClick,
}: FooterProps) => {

  const renderClickableText = (text: string, buttonClassName: string) => {
    if (!onSilaClick) return text;
    const parts = text.split(/(Sila)/i);
    return parts.map((part, i) => {
      if (part.toLowerCase() === "sila") {
        return (
          <button
            key={i}
            onClick={onSilaClick}
            className={cn("focus:outline-none cursor-pointer transition-colors duration-200", buttonClassName)}
          >
            {part}
          </button>
        );
      }
      return part;
    });
  };

  return (
    <section className={cn("relative w-full mt-0 overflow-hidden", className)}>
      <footer className="border-t bg-background mt-4 relative">
        <div className="max-w-7xl flex flex-col justify-between mx-auto relative p-4 py-6 md:py-8">
          <div className="flex flex-col mb-12 sm:mb-20 md:mb-0 w-full">
            <div className="w-full flex flex-col items-center">
              <div className="space-y-2 flex flex-col items-center flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-foreground text-3xl font-bold">
                    {renderClickableText(brandName, "hover:text-cyan-500 font-bold")}
                  </span>
                </div>
                <p className="text-muted-foreground font-semibold text-center w-full max-w-sm sm:w-96 px-4 sm:px-0">
                  {brandDescription}
                </p>
              </div>

              {socialLinks.length > 0 && (
                <div className="flex mb-8 mt-5 gap-4">
                  {socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="w-6 h-6 hover:scale-110 duration-300">
                        {link.icon}
                      </div>
                      <span className="sr-only">{link.label}</span>
                    </a>
                  ))}
                </div>
              )}

              {navLinks.length > 0 && (
                <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-muted-foreground max-w-full px-4">
                  {navLinks.map((link, index) => {
                    if (link.href === "#admin" && onSilaClick) {
                      return (
                        <button
                          key={index}
                          type="button"
                          className="hover:text-foreground duration-300 hover:font-semibold focus:outline-none cursor-pointer"
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
                        className="hover:text-foreground duration-300 hover:font-semibold"
                        href={link.href}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        key={index}
                        className="hover:text-foreground duration-300 hover:font-semibold"
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
            <p className="text-[10px] min-[360px]:text-xs sm:text-sm md:text-base text-muted-foreground flex flex-row items-center justify-center gap-1.5 sm:gap-2.5 whitespace-nowrap">
              <span>
                ©{new Date().getFullYear()} {renderClickableText(brandName, "hover:text-foreground font-medium")}. All rights reserved.
              </span>
            </p>
          </div>
        </div>

        {/* Large background text - FIXED */}
        <div 
          className="bg-gradient-to-b from-foreground/15 via-foreground/5 to-transparent bg-clip-text text-transparent leading-none absolute left-1/2 -translate-x-1/2 bottom-2 md:bottom-1 font-extrabold tracking-tighter pointer-events-none select-none text-center px-4"
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
