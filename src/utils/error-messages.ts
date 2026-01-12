/**
 * Utilitaires pour générer des messages d'erreur contextuels et détaillés
 */

/**
 * Messages d'erreur contextuels pour les formulaires
 */
export const ErrorMessages = {
  // Champs requis
  required: (fieldName: string) => `${fieldName} est obligatoire.`,
  
  // Email
  emailInvalid: (email?: string) => 
    email 
      ? `L'email "${email}" n'est pas valide. Format attendu : utilisateur@exemple.com`
      : 'Format d\'email invalide. Exemple : utilisateur@exemple.com',
  
  emailAlreadyExists: (email: string) => 
    `L'email "${email}" est déjà utilisé. Veuillez en choisir un autre.`,
  
  // Mot de passe
  passwordTooShort: (minLength: number) => 
    `Le mot de passe doit contenir au moins ${minLength} caractères.`,
  
  passwordWeak: () => 
    'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.',
  
  passwordMismatch: () => 
    'Les mots de passe ne correspondent pas. Veuillez vérifier votre saisie.',
  
  // Slug / Identifiant unique
  slugInvalid: () => 
    'L\'identifiant ne peut contenir que des lettres minuscules, chiffres et tirets. Exemple : mon-identifiant-123',
  
  slugAlreadyExists: (slug: string) => 
    `Le nom d'espace "${slug}" est déjà utilisé. Veuillez en choisir un autre.`,
  
  // Nom / Prénom
  nameTooShort: (fieldName: string, minLength: number) => 
    `${fieldName} doit contenir au moins ${minLength} caractères.`,
  
  nameTooLong: (fieldName: string, maxLength: number) => 
    `${fieldName} ne peut pas dépasser ${maxLength} caractères.`,
  
  // Téléphone
  phoneInvalid: () => 
    'Format de téléphone invalide. Utilisez uniquement des chiffres, espaces, tirets et le signe +. Exemple : +33 1 23 45 67 89',
  
  // Code pays
  countryCodeInvalid: () => 
    'Le code pays doit contenir entre 1 et 5 caractères. Exemple : FR, TG, US',
  
  // Rôle
  roleRequired: () => 
    'Veuillez sélectionner un rôle pour cet utilisateur.',
  
  // Stock
  stockInsufficient: (available: number, requested: number) => 
    `Stock insuffisant. Disponible : ${available}, Demandé : ${requested}`,
  
  stockEmpty: () => 
    'Ce produit est en rupture de stock.',
  
  // Vente
  cartEmpty: () => 
    'Le panier est vide. Ajoutez des produits avant de finaliser la vente.',
  
  // Générique
  genericError: (action: string) => 
    `Une erreur est survenue lors de ${action}. Veuillez réessayer.`,
  
  networkError: () => 
    'Erreur de connexion. Vérifiez votre connexion internet et réessayez.',
  
  unauthorized: () => 
    'Vous n\'êtes pas autorisé à effectuer cette action. Veuillez contacter un administrateur.',
  
  notFound: (resource: string) => 
    `${resource} introuvable. Il a peut-être été supprimé ou n'existe pas.`,
  
  serverError: () => 
    'Erreur serveur. Veuillez réessayer dans quelques instants. Si le problème persiste, contactez le support.',
} as const;

/**
 * Formate un message d'erreur depuis une erreur serveur
 */
export function formatServerError(error: unknown, defaultMessage: string): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object') {
    // Erreur avec propriété message
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    
    // Erreur avec propriété error
    if ('error' in error && typeof error.error === 'string') {
      return error.error;
    }
    
    // Erreur avec propriété detail (format API standard)
    if ('detail' in error && typeof error.detail === 'string') {
      return error.detail;
    }
  }
  
  return defaultMessage;
}

/**
 * Extrait un message d'erreur contextuel depuis un résultat d'action
 */
export function getActionErrorMessage(
  result: { success: false; error?: string },
  action: string
): string {
  if (result.error) {
    // Si l'erreur contient déjà un message contextuel, l'utiliser
    if (result.error.length > 20) {
      return result.error;
    }
    
    // Sinon, formater avec le contexte
    return formatServerError(result.error, ErrorMessages.genericError(action));
  }
  
  return ErrorMessages.genericError(action);
}
