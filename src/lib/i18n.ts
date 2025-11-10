import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "welcome": "Welcome",
      "login": "Login",
      "signup": "Sign Up",
      "logout": "Logout",
      "dashboard": "Dashboard",
      "profile": "Profile",
      "settings": "Settings",
      "language": "Language",
      "footer": {
        "copyright": "© 2024 Credit Stirling Bank PLC",
        "rights": "All rights reserved"
      }
    }
  },
  es: {
    translation: {
      "welcome": "Bienvenido",
      "login": "Iniciar Sesión",
      "signup": "Registrarse",
      "logout": "Cerrar Sesión",
      "dashboard": "Panel",
      "profile": "Perfil",
      "settings": "Configuración",
      "language": "Idioma",
      "footer": {
        "copyright": "© 2024 Credit Stirling Bank PLC",
        "rights": "Todos los derechos reservados"
      }
    }
  },
  fr: {
    translation: {
      "welcome": "Bienvenue",
      "login": "Connexion",
      "signup": "S'inscrire",
      "logout": "Se Déconnecter",
      "dashboard": "Tableau de Bord",
      "profile": "Profil",
      "settings": "Paramètres",
      "language": "Langue",
      "footer": {
        "copyright": "© 2024 Credit Stirling Bank PLC",
        "rights": "Tous droits réservés"
      }
    }
  },
  de: {
    translation: {
      "welcome": "Willkommen",
      "login": "Anmelden",
      "signup": "Registrieren",
      "logout": "Abmelden",
      "dashboard": "Dashboard",
      "profile": "Profil",
      "settings": "Einstellungen",
      "language": "Sprache",
      "footer": {
        "copyright": "© 2024 Credit Stirling Bank PLC",
        "rights": "Alle Rechte vorbehalten"
      }
    }
  },
  zh: {
    translation: {
      "welcome": "欢迎",
      "login": "登录",
      "signup": "注册",
      "logout": "登出",
      "dashboard": "仪表板",
      "profile": "个人资料",
      "settings": "设置",
      "language": "语言",
      "footer": {
        "copyright": "© 2024 Credit Stirling Bank PLC",
        "rights": "版权所有"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
