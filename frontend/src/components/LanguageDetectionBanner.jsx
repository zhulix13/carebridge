import { Languages, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function LanguageDetectionBanner({ detectedCode, currentCode, onAccept, onDismiss }) {
  const { i18n } = useTranslation();
  const t = i18n.getFixedT(detectedCode);

  if (!detectedCode || detectedCode === currentCode) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-lg animate-[slideUp_0.4s_ease-out] shadow-2xl">
      <div className="backdrop-blur-md bg-sky-950/90 border border-sky-800 text-white rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
            <Languages size={20} />
          </div>
          <div>
            <p className="text-xs text-sky-300 font-semibold uppercase tracking-wider">{t('languageBanner.title')}</p>
            <p className="text-sm font-medium text-slate-100 mt-0.5">
              {t('languageBanner.prompt', { language: t(`languages.${detectedCode}`) })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onAccept(detectedCode)}
            className="rounded-lg bg-sky-500 hover:bg-sky-400 px-3.5 py-1.5 text-xs font-bold text-sky-950 transition duration-200 cursor-pointer shadow-md shadow-sky-500/10 whitespace-nowrap"
            type="button"
          >
            {t('languageBanner.switch')}
          </button>

          <button
            onClick={onDismiss}
            className="rounded-lg border border-sky-800 hover:bg-sky-900/40 px-3 py-1.5 text-xs font-bold text-sky-300 transition duration-200 cursor-pointer whitespace-nowrap"
            type="button"
          >
            {t('languageBanner.keep', { language: t(`languages.${currentCode}`) })}
          </button>

          <button
            onClick={onDismiss}
            className="p-1 text-sky-400 hover:text-white transition cursor-pointer"
            type="button"
            aria-label={t('languageBanner.close')}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
