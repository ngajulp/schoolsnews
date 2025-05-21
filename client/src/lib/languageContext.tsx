import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'french' | 'english';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

interface Translations {
  [key: string]: {
    french: string;
    english: string;
  };
}

// Translation keys
const translations: Translations = {
  // Common
  'app.title': {
    french: 'Système de Gestion Scolaire',
    english: 'School Management System'
  },
  'app.welcome': {
    french: 'Bienvenue dans votre système de gestion scolaire',
    english: 'Welcome to your school management system'
  },
  'common.save': {
    french: 'Enregistrer',
    english: 'Save'
  },
  'common.cancel': {
    french: 'Annuler',
    english: 'Cancel'
  },
  'common.delete': {
    french: 'Supprimer',
    english: 'Delete'
  },
  'common.edit': {
    french: 'Modifier',
    english: 'Edit'
  },
  'common.add': {
    french: 'Ajouter',
    english: 'Add'
  },
  'common.search': {
    french: 'Rechercher',
    english: 'Search'
  },
  'common.close': {
    french: 'Fermer',
    english: 'Close'
  },
  'common.actions': {
    french: 'Actions',
    english: 'Actions'
  },
  'common.submit': {
    french: 'Soumettre',
    english: 'Submit'
  },
  'common.back': {
    french: 'Retour',
    english: 'Back'
  },
  'common.next': {
    french: 'Suivant',
    english: 'Next'
  },
  'common.loading': {
    french: 'Chargement...',
    english: 'Loading...'
  },
  'common.noResults': {
    french: 'Aucun résultat trouvé',
    english: 'No results found'
  },
  
  // Auth
  'auth.login': {
    french: 'Connexion',
    english: 'Login'
  },
  'auth.logout': {
    french: 'Déconnexion',
    english: 'Logout'
  },
  'auth.email': {
    french: 'Email',
    english: 'Email'
  },
  'auth.password': {
    french: 'Mot de passe',
    english: 'Password'
  },
  'auth.forgotPassword': {
    french: 'Mot de passe oublié ?',
    english: 'Forgot password?'
  },
  'auth.loginButton': {
    french: 'Se connecter',
    english: 'Sign in'
  },
  
  // Dashboard
  'dashboard.title': {
    french: 'Tableau de bord',
    english: 'Dashboard'
  },
  'dashboard.welcome': {
    french: 'Bienvenue, {name}',
    english: 'Welcome, {name}'
  },
  'dashboard.students': {
    french: 'Étudiants',
    english: 'Students'
  },
  'dashboard.teachers': {
    french: 'Enseignants',
    english: 'Teachers'
  },
  'dashboard.classes': {
    french: 'Classes',
    english: 'Classes'
  },
  'dashboard.subjects': {
    french: 'Matières',
    english: 'Subjects'
  },
  
  // Navigation
  'nav.dashboard': {
    french: 'Tableau de bord',
    english: 'Dashboard'
  },
  'nav.students': {
    french: 'Apprenants',
    english: 'Students'
  },
  'nav.teachers': {
    french: 'Enseignants',
    english: 'Teachers'
  },
  'nav.employees': {
    french: 'Employés',
    english: 'Employees'
  },
  'nav.classes': {
    french: 'Classes',
    english: 'Classes'
  },
  'nav.subjects': {
    french: 'Matières',
    english: 'Subjects'
  },
  'nav.timetable': {
    french: 'Emploi du temps',
    english: 'Timetable'
  },
  'nav.exams': {
    french: 'Examens',
    english: 'Exams'
  },
  'nav.results': {
    french: 'Résultats',
    english: 'Results'
  },
  'nav.library': {
    french: 'Bibliothèque',
    english: 'Library'
  },
  'nav.chat': {
    french: 'Messagerie',
    english: 'Chat'
  },
  'nav.settings': {
    french: 'Paramètres',
    english: 'Settings'
  },
  'nav.activities': {
    french: 'Activités',
    english: 'Activities'
  },
  'nav.finances': {
    french: 'Finances',
    english: 'Finances'
  },
  'nav.parents': {
    french: 'Parents',
    english: 'Parents'
  },
  'nav.admin': {
    french: 'Administration',
    english: 'Admin'
  },
  
  // Settings
  'settings.title': {
    french: 'Paramètres',
    english: 'Settings'
  },
  'settings.language': {
    french: 'Langue',
    english: 'Language'
  },
  'settings.french': {
    french: 'Français',
    english: 'French'
  },
  'settings.english': {
    french: 'Anglais',
    english: 'English'
  },
  'settings.theme': {
    french: 'Thème',
    english: 'Theme'
  },
  'settings.light': {
    french: 'Clair',
    english: 'Light'
  },
  'settings.dark': {
    french: 'Sombre',
    english: 'Dark'
  },
  'settings.profile': {
    french: 'Profil',
    english: 'Profile'
  },

  // Homework
  'homework.title': {
    french: 'Devoirs',
    english: 'Homework'
  },
  'homework.add': {
    french: 'Ajouter un devoir',
    english: 'Add homework'
  },
  'homework.edit': {
    french: 'Modifier le devoir',
    english: 'Edit homework'
  },
  'homework.delete': {
    french: 'Supprimer le devoir',
    english: 'Delete homework'
  },
  'homework.subject': {
    french: 'Matière',
    english: 'Subject'
  },
  'homework.dueDate': {
    french: 'Date limite',
    english: 'Due date'
  },
  'homework.description': {
    french: 'Description',
    english: 'Description'
  },
  'homework.attachment': {
    french: 'Pièce jointe',
    english: 'Attachment'
  },
  'homework.class': {
    french: 'Classe',
    english: 'Class'
  },
  'homework.submit': {
    french: 'Soumettre un devoir',
    english: 'Submit homework'
  },
  'homework.submitSuccess': {
    french: 'Devoir soumis avec succès',
    english: 'Homework submitted successfully'
  },
  'homework.response': {
    french: 'Réponse',
    english: 'Response'
  },

  // Role management
  'roles.title': {
    french: 'Gestion des rôles',
    english: 'Role Management'
  },
  'roles.add': {
    french: 'Ajouter un rôle',
    english: 'Add role'
  },
  'roles.edit': {
    french: 'Modifier le rôle',
    english: 'Edit role'
  },
  'roles.delete': {
    french: 'Supprimer le rôle',
    english: 'Delete role'
  },
  'roles.name': {
    french: 'Nom du rôle',
    english: 'Role name'
  },
  'roles.description': {
    french: 'Description',
    english: 'Description'
  },
  'roles.permissions': {
    french: 'Permissions',
    english: 'Permissions'
  },
  'roles.users': {
    french: 'Utilisateurs',
    english: 'Users'
  },

  // Chat
  'chat.title': {
    french: 'Messagerie',
    english: 'Chat'
  },
  'chat.newMessage': {
    french: 'Nouveau message',
    english: 'New message'
  },
  'chat.send': {
    french: 'Envoyer',
    english: 'Send'
  },
  'chat.rooms': {
    french: 'Salles de discussion',
    english: 'Chat rooms'
  },
  'chat.createRoom': {
    french: 'Créer une salle',
    english: 'Create room'
  },
  'chat.addParticipant': {
    french: 'Ajouter un participant',
    english: 'Add participant'
  }
};

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider component
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Get saved language from localStorage or use french as default
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage as Language) || 'french';
  });

  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language === 'french' ? 'fr' : 'en';
  }, [language]);

  // Set language function
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  // Translation function
  const t = (key: string, params?: Record<string, string>) => {
    // Get translation
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }

    let text = translation[language];
    
    // Replace params if provided
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{${param}}`, value);
      });
    }
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};