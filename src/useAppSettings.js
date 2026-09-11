import { useSelector, useDispatch } from 'react-redux';
import { en } from './locales/en';
import { ep } from './locales/ep';
import { toggleLang as toggleLangAction, toggleTheme as toggleThemeAction } from './store/settingsSlice';
import { useEffect, useMemo } from 'react';
import { getDeviceId } from './utils/deviceId';

export const useAppSettings = () => {
  const { lang, theme } = useSelector((state) => state.settings);
  const dispatch = useDispatch();

  const t = lang === 'en' ? en : ep;

  const toggleLang = () => dispatch(toggleLangAction());
  const toggleTheme = () => dispatch(toggleThemeAction());

  const deviceId = useMemo(() => getDeviceId(), []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [theme]);

  return { t, lang, theme, toggleLang, toggleTheme, deviceId };
};
