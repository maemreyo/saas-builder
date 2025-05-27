export const languages = ['en', 'es', 'fr', 'de', 'pt', 'ja', 'zh'] as const
export type Language = typeof languages[number]

export const defaultLanguage = 'en' as const

export const languageNames: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  ja: '日本語',
  zh: '中文',
}

export type TranslationKey = 
  | 'common.welcome'
  | 'common.signIn'
  | 'common.signUp'
  | 'common.signOut'
  | 'common.settings'
  | 'common.profile'
  | 'common.dashboard'
  | 'common.save'
  | 'common.cancel'
  | 'common.delete'
  | 'common.edit'
  | 'common.loading'
  | 'common.error'
  | 'common.success'
  | 'auth.emailPlaceholder'
  | 'auth.passwordPlaceholder'
  | 'auth.forgotPassword'
  | 'auth.resetPassword'
  | 'auth.createAccount'
  | 'auth.alreadyHaveAccount'
  | 'auth.dontHaveAccount'
  | 'dashboard.welcome'
  | 'dashboard.stats'
  | 'dashboard.recentActivity'
  | 'settings.account'
  | 'settings.appearance'
  | 'settings.billing'
  | 'settings.notifications'
  | 'settings.security'
  | 'billing.currentPlan'
  | 'billing.upgrade'
  | 'billing.downgrade'
  | 'billing.invoices'
  | 'billing.paymentMethods'
  | 'errors.somethingWentWrong'
  | 'errors.pageNotFound'
  | 'errors.unauthorized'
  | 'errors.forbidden'

export type Translations = Record<TranslationKey, string>
