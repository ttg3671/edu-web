import React from 'react';
import { useAppSettings } from '../useAppSettings';
import { FaInstagram, FaFacebookF, FaTiktok, FaYoutube } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import logo from '../assets/edu_logo.jpeg';

const Footer = () => {
  const { t } = useAppSettings();
  const socialStats = [
    { Icon: FaInstagram, count: "1.28M", label: "Instagram", href: "https://www.instagram.com/edugarcia_trainer/" },
    { Icon: FaFacebookF, count: "430K", label: "Facebook", href: "https://www.facebook.com/people/Edu-Garcia/61555837111324/#" },
    { Icon: FaTiktok, count: "430K", label: "TikTok", href: "https://www.tiktok.com/@edugarcia_trainer" },
    { Icon: FaYoutube, count: "106K", label: "YouTube", href: "https://www.youtube.com/@edugarcia_trainer/featured" },
  ];

  return (
    <footer className="bg-custom-bg text-custom-text py-6 px-6 border-t border-white/5 font-normal">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        
        {/* Upper Part */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-center mb-6">
          
          {/* Left: Logo and Socials (Centered) */}
          <div className="flex flex-col items-center gap-3">
            <img src={logo} alt="EduGarcia Logo" loading="lazy" className="h-10 w-auto object-contain rounded-full" />
            
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {socialStats.map((stat, idx) => (
                <a key={idx} href={stat.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group cursor-pointer">
                  <stat.Icon size={20} className="text-custom-primary" />
                  <span className="text-[12px] text-custom-text/60">{stat.count}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Center: Legal Links (Centered) */}
          <div className="flex flex-col items-center md:items-start uppercase gap-2 text-[14px] tracking-wide">
            <Link to="/terms" className="hover:text-custom-primary transition-colors text-center md:text-left">{t.terms.title}</Link>
            <Link to="/legal" className="hover:text-custom-primary transition-colors text-center md:text-left">{t.legal.title}</Link>
            <Link to="/cookies" className="hover:text-custom-primary transition-colors text-center md:text-left">{t.cookies.title}</Link>
            <Link to="/privacy" className="hover:text-custom-primary transition-colors text-center md:text-left">{t.privacy.title}</Link>
          </div>

          {/* Right: Motivational Sentence (Centered) */}
          <div className="text-center">
            <p className="text-lg md:text-xl font-medium text-custom-primary italic leading-tight">
              Make your body your best friend.
            </p>
          </div>
        </div>

        {/* Separator Line */}
        <div className="w-full h-[1px] bg-white/10 mb-4"></div>

        {/* Lower Part (Centered) */}
        <div className="w-full flex justify-center">
          <p className="text-[12px] text-custom-text/40 tracking-widest uppercase">
            @ 2024 Edu Garcia
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
