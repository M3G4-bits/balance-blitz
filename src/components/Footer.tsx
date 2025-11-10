import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="w-full py-6 px-4 border-t border-border bg-background">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            {t('footer.copyright', '© 2024 Credit Stirling Bank PLC')}
            <br className="md:hidden" />
            <span className="hidden md:inline"> | </span>
            {t('footer.rights', 'All rights reserved')}
          </p>
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
