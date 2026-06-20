import { Footer as AnimatedFooter } from './ui/modem-animated-footer'
import { FaGithub, FaInstagram, FaFacebookF } from 'react-icons/fa'

export default function Footer({ onSilaClick }) {
  const socialLinks = [
    {
      icon: <FaGithub className="w-5 h-5" />,
      href: "https://github.com/sila911",
      label: "GitHub",
    },
    {
      icon: <FaInstagram className="w-5 h-5" />,
      href: "https://www.instagram.com/siladc/",
      label: "Instagram",
    },
    {
      icon: <FaFacebookF className="w-5 h-5" />,
      href: "https://www.facebook.com/silaadc",
      label: "Facebook",
    },
  ]

  return (
    <AnimatedFooter
      brandName="Ask Sila Anything"
      brandDescription="A platform to ask me questions anonymously or publicly, drop comments, and interact."
      socialLinks={socialLinks}
      onSilaClick={onSilaClick}
    />
  )
}
