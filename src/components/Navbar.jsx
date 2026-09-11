import React, { useState } from 'react';
import { useAppSettings } from '../useAppSettings';
import { 
  FaInstagram, 
  FaFacebookF, 
  FaTiktok, 
  FaYoutube, 
  FaBars, 
  FaTimes, 
  FaGlobe, 
  FaSun, 
  FaMoon, 
  FaChevronDown,
  FaUser,
  FaSignOutAlt,
  FaCog,
  FaCreditCard,
  FaMobileAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/edu_logo.jpeg';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../redux/user/user.actions';
import { axiosPrivate } from '../api/axios';

const Navbar = () => {
  const { lang, toggleLang, theme, toggleTheme, t, deviceId } = useAppSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isUserMenuOpen, setIsUserUserMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentUser = useSelector((state) => state.user.currentUser);

  const handleAboutClick = (e) => {
    setIsMenuOpen(false);
    if (location.pathname === '/') {
      e.preventDefault();
      const featuresSection = document.getElementById('programs');
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        const featuresSection = document.getElementById('programs');
        if (featuresSection) {
          featuresSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await axiosPrivate.post('/api/v1/logout', { device_id: deviceId });
    } catch (error) {
      // Silent error
    } finally {
      dispatch(logoutUser());
      setIsMenuOpen(false);
      setIsUserUserMenuOpen(false);
      setLoggingOut(false);
      navigate('/');
    }
  };

  const navLinks = [
    { href: "/", label: t.navbar.home },
    { href: "/edugarcia-app", label: t.navbar.app },
    ...(currentUser && currentUser.is_reviewer === 0 ? [
      { href: "/pricing", label: t.navbar.pricing },
    ] : []),
    ...(currentUser ? [
      { href: "/settings", label: t.navbar.settings }
    ] : []),
  ];

  const moreLinks = [
    { href: "#programs", label: t.navbar.about, onClick: handleAboutClick },
    { href: "/contact", label: t.navbar.contact },
    { href: "/faq", label: t.navbar.faq },
  ];

  const socialStats = [
    { Icon: FaInstagram, count: "1.28M", label: "Instagram", href: "https://www.instagram.com/edugarcia_trainer/" },
    { Icon: FaFacebookF, count: "430K", label: "Facebook", href: "https://www.facebook.com/people/Edu-Garcia/61555837111324/#" },
    { Icon: FaTiktok, count: "430K", label: "TikTok", href: "https://www.tiktok.com/@edugarcia_trainer" },
    { Icon: FaYoutube, count: "106K", label: "YouTube", href: "https://www.youtube.com/@edugarcia_trainer/featured" },
  ];

  const btnShadow = theme === 'dark' 
    ? "shadow-[0_0_10px_rgba(245,197,66,0.2)]" 
    : "shadow-[0_0_10px_rgba(212,160,23,0.2)]";

  return (
    <nav className={`fixed top-0 left-0 z-50 w-full px-6 py-4 transition-all duration-300 ${theme === 'dark' ? 'bg-black' : 'bg-white shadow-md'}`}>
      <div className="max-w-[1400px] mx-auto flex justify-between items-center">
        
        {/* Left: Logo & Branding */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logo} alt="EduGarcia Logo" loading="lazy" className="h-10 w-auto object-contain rounded-full" />
            <span className="text-custom-primary text-sm font-normal tracking-wider uppercase">edugarciamovimiento</span>
          </Link>
          
          <div className={`hidden xl:flex items-center gap-6 ml-4 border-l pl-6 ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}>
            {socialStats.map((stat, idx) => (
              <a key={idx} href={stat.href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group cursor-pointer">
                <stat.Icon className="text-custom-primary group-hover:text-custom-text transition-colors mb-0.5 text-[18px]" />
                <span className={`text-[10px] font-normal leading-none ${theme === 'dark' ? 'text-custom-primary/80' : 'text-black/60'}`}>{stat.count}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Right: Navigation & Toggles */}
        <div className="hidden lg:flex items-center gap-8">
          <div className={`flex gap-8 text-sm font-normal tracking-wide items-center ${theme === 'dark' ? 'text-white/70' : 'text-black/70'}`}>
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                to={link.href} 
                className={`transition-colors ${location.pathname === link.href ? 'text-custom-primary' : 'hover:text-custom-primary'}`}
              >
                {link.label}
              </Link>
            ))}
            
            {/* More Dropdown */}
            <div className="relative group">
              <button 
                onMouseEnter={() => setIsMoreOpen(true)}
                onMouseLeave={() => setIsMoreOpen(false)}
                className="flex items-center gap-1 hover:text-custom-primary transition-colors cursor-pointer"
              >
                {t.navbar.more} <FaChevronDown size={10} />
              </button>
              
              <AnimatePresence>
                {isMoreOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    onMouseEnter={() => setIsMoreOpen(true)}
                    onMouseLeave={() => setIsMoreOpen(false)}
                    className={`absolute top-full right-0 mt-2 w-40 border py-3 px-4 shadow-2xl ${theme === 'dark' ? 'bg-black border-white/10' : 'bg-white border-black/10'}`}
                  >
                    {moreLinks.map((link) => (
                      link.onClick ? (
                        <button
                          key={link.label}
                          onClick={link.onClick}
                          className={`block w-full text-left py-2 text-xs transition-colors cursor-pointer ${theme === 'dark' ? 'text-white/80 hover:text-custom-primary' : 'text-black/80 hover:text-custom-primary'}`}
                        >
                          {link.label}
                        </button>
                      ) : (
                        <Link key={link.href} to={link.href} className={`block py-2 text-xs transition-colors ${theme === 'dark' ? 'text-white/80 hover:text-custom-primary' : 'text-black/80 hover:text-custom-primary'}`}>
                          {link.label}
                        </Link>
                      )
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Auth / User Menu */}
            {!currentUser ? (
              <Link to="/login" className="hover:text-custom-primary transition-colors uppercase font-bold tracking-tighter">
                {t.auth.signIn}
              </Link>
            ) : (
              <div className="relative">
                <button 
                  onMouseEnter={() => setIsUserUserMenuOpen(true)}
                  onMouseLeave={() => setIsUserUserMenuOpen(false)}
                  className="flex items-center gap-2 text-custom-primary hover:text-white transition-colors cursor-pointer"
                >
                  <FaUser />
                  <span className="uppercase font-bold tracking-tighter max-w-[100px] truncate">{currentUser.name}</span>
                  <FaChevronDown size={10} />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      onMouseEnter={() => setIsUserUserMenuOpen(true)}
                      onMouseLeave={() => setIsUserUserMenuOpen(false)}
                      className={`absolute top-full right-0 mt-2 w-48 border py-3 px-4 shadow-2xl ${theme === 'dark' ? 'bg-black border-white/10' : 'bg-white border-black/10'}`}
                    >
                      {currentUser.is_reviewer === 0 && (
                        <>
                          <Link to="/profile" className={`flex items-center gap-3 py-2 text-xs transition-colors ${theme === 'dark' ? 'text-white/80 hover:text-custom-primary' : 'text-black/80 hover:text-custom-primary'}`}>
                            <FaUser size={12} /> {t.profile.title}
                          </Link>
                          <Link to="/devices" className={`flex items-center gap-3 py-2 text-xs transition-colors ${theme === 'dark' ? 'text-white/80 hover:text-custom-primary' : 'text-black/80 hover:text-custom-primary'}`}>
                            <FaMobileAlt size={12} /> Devices
                          </Link>
                          <div className={`h-px w-full my-2 ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}`}></div>
                        </>
                      )}
                      <button 
                        onClick={handleLogout}
                        className={`flex w-full items-center gap-3 py-2 text-xs transition-colors cursor-pointer ${theme === 'dark' ? 'text-white/80 hover:text-red-500' : 'text-black/80 hover:text-red-500'}`}
                      >
                        <FaSignOutAlt size={12} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-4 ml-2">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleLang}
              className={`p-1.5 rounded-lg text-custom-primary bg-black/5 ${btnShadow} hover:bg-custom-primary hover:text-black transition-all flex items-center gap-1.5 cursor-pointer`}
            >
              <FaGlobe size={14} />
              <span className="text-[10px] font-medium uppercase">{lang}</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className={`p-1.5 rounded-lg text-custom-primary bg-black/5 ${btnShadow} hover:bg-custom-primary hover:text-black transition-all cursor-pointer`}
            >
              {theme === 'dark' ? <FaSun size={14} /> : <FaMoon size={14} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="lg:hidden flex items-center gap-4">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="text-custom-primary cursor-pointer"
          >
            {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'calc(100vh - 72px)' }}
            exit={{ opacity: 0, height: 0 }}
            className={`lg:hidden overflow-y-auto ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}
          >
            <div className={`flex flex-col p-8 gap-6 font-normal tracking-wide text-center ${theme === 'dark' ? 'text-white/70' : 'text-black/70'}`}>
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  to={link.href} 
                  onClick={() => setIsMenuOpen(false)} 
                  className={`transition-colors text-lg ${location.pathname === link.href ? 'text-custom-primary' : 'hover:text-custom-primary'}`}
                >
                  {link.label}
                </Link>
              ))}
              
              {moreLinks.map((link) => (
                link.onClick ? (
                  <button
                    key={link.label}
                    onClick={link.onClick}
                    className="transition-colors text-lg hover:text-custom-primary cursor-pointer"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link 
                    key={link.href} 
                    to={link.href} 
                    onClick={() => setIsMenuOpen(false)} 
                    className={`transition-colors text-lg ${location.pathname === link.href ? 'text-custom-primary' : 'hover:text-custom-primary'}`}
                  >
                    {link.label}
                  </Link>
                )
              ))}

              {currentUser && currentUser.is_reviewer === 0 && (
                <>
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="transition-colors text-lg hover:text-custom-primary">{t.profile.title}</Link>
                  <Link to="/devices" onClick={() => setIsMenuOpen(false)} className="transition-colors text-lg hover:text-custom-primary">Devices</Link>
                </>
              )}

              {currentUser ? (
                <button 
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full py-3 border border-red-500 bg-transparent text-red-500 font-bold uppercase tracking-widest text-sm transition-all hover:bg-red-500 hover:text-white disabled:opacity-50 flex items-center justify-center gap-3 rounded-xl"
                >
                  {loggingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
                      Logging out...
                    </>
                  ) : (
                    <>
                      <FaSignOutAlt size={14} />
                      Logout
                    </>
                  )}
                </button>
              ) : (
                <Link 
                  to="/login" 
                  onClick={() => setIsMenuOpen(false)} 
                  className="transition-colors text-lg text-custom-primary font-bold uppercase"
                >
                  {t.auth.signIn}
                </Link>
              )}
              
              {/* Mobile Socials */}
              <div className={`grid grid-cols-4 gap-4 py-4 border-y ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}>
                {socialStats.map((stat, idx) => (
                  <a key={idx} href={stat.href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
                    <stat.Icon className="text-custom-primary mb-1 text-[24px]" />
                    <span className={`text-[10px] ${theme === 'dark' ? 'text-custom-primary/70' : 'text-black/60'}`}>{stat.count}</span>
                  </a>
                ))}
              </div>

              <div className="flex justify-center gap-8 pt-4">
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleLang} 
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <FaGlobe size={18} /> {lang.toUpperCase()}
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleTheme}
                  className="cursor-pointer"
                >
                  {theme === 'dark' ? <FaSun size={18} /> : <FaMoon size={18} />}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
