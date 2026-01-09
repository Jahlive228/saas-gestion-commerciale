import "server-only";

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { JWTPayload, LoginResponse, Session } from '@/models/auth';
import { env } from "process";

const JWT_SECRET = new TextEncoder().encode(env.SESSION_SECRET);

const SESSION_COOKIE_NAME = 'legombopay-session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 jours

export class SessionManager {
  /**
   * Décode le JWT token pour extraire le payload
   */
  private static decodeJWTPayload(token: string): JWTPayload | null {
    try {
      const payload = token.split('.')[1];
      const decoded = Buffer.from(payload, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Erreur lors du décodage du JWT:', error);
      return null;
    }
  }

  /**
   * Chiffre et stocke la session dans un cookie HTTP
   */
  static async createSession(loginResponse: LoginResponse): Promise<void> {
    console.log('createSessionAction', loginResponse);
    const jwtPayload = SessionManager.decodeJWTPayload(loginResponse.content.token);
    
    if (!jwtPayload) {
      throw new Error('Token JWT invalide');
    }

    const session: Session = {
      user: loginResponse.content.user,
      token: loginResponse.content.token,
      jwtPayload: jwtPayload,
      expires_at: new Date(jwtPayload.exp * 1000), // exp est en secondes
      created_at: new Date(),
    };

    // Créer le JWT avec les données de session
    const jwt = await new SignJWT({ session })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(new Date(Date.now() + SESSION_DURATION))
      .sign(JWT_SECRET);

    // Stocker dans un cookie HTTP-only sécurisé
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000, // en secondes
      path: '/',
    });
  }

  /**
   * Récupère et déchiffre la session depuis le cookie
   */
  static async getSession(): Promise<Session | null> {
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

      if (!sessionCookie?.value) {
        return null;
      }

      // Vérifier et décoder le JWT
      const { payload } = await jwtVerify(sessionCookie.value, JWT_SECRET);
      
      if (!payload.session) {
        return null;
      }

      const session = payload.session as Session;

      // Vérifier si la session n'est pas expirée
      if (new Date(session.expires_at) < new Date()) {
        await SessionManager.destroySession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Erreur lors de la récupération de la session:', error);
      await SessionManager.destroySession();
      return null;
    }
  }

  /**
   * Récupère uniquement le token d'accès
   */
  static async getAccessToken(): Promise<string | null> {
    const session = await SessionManager.getSession();
    return session?.token || null;
  }

  /**
   * Récupère uniquement l'utilisateur
   */
  static async getUser(): Promise<Session['user'] | null> {
    const session = await SessionManager.getSession();
    return session?.user || null;
  }

  /**
   * Vérifie si l'utilisateur est connecté
   */
  static async isAuthenticated(): Promise<boolean> {
    const session = await SessionManager.getSession();
    return session !== null;
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  static async hasRole(roleName: string): Promise<boolean> {
    const session = await SessionManager.getSession();
    return session?.jwtPayload?.role_name === roleName || false;
  }

  /**
   * Vérifie si l'utilisateur a une permission spécifique
   */
  static async hasPermission(permissionName: string): Promise<boolean> {
    const session = await SessionManager.getSession();
    return session?.jwtPayload?.permissions?.includes(permissionName) || false;
  }

  /**
   * Vérifie si l'utilisateur est superadmin
   */
  static async isSuperAdmin(): Promise<boolean> {
    const session = await SessionManager.getSession();
    return session?.jwtPayload?.is_superadmin || false;
  }

  /**
   * Vérifie si l'utilisateur est admin
   */
  static async isAdmin(): Promise<boolean> {
    const session = await SessionManager.getSession();
    return session?.jwtPayload?.is_admin || false;
  }

  /**
   * Vérifie si l'utilisateur est client
   */
  static async isClient(): Promise<boolean> {
    const session = await SessionManager.getSession();
    return session?.jwtPayload?.is_client || false;
  }

  /**
   * Met à jour la session avec de nouvelles données utilisateur
   */
  static async updateSession(updates: Partial<Session>): Promise<void> {
    const currentSession = await SessionManager.getSession();
    
    if (!currentSession) {
      throw new Error('Aucune session active trouvée');
    }

    const updatedSession: Session = {
      ...currentSession,
      ...updates,
    };

    // Recréer le JWT avec les données mises à jour
    const jwt = await new SignJWT({ session: updatedSession })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(new Date(Date.now() + SESSION_DURATION))
      .sign(JWT_SECRET);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000,
      path: '/',
    });
  }

  /**
   * Détruit la session (logout)
   */
  static async destroySession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  }

  /**
   * Rafraîchit la session (étend la durée d'expiration)
   */
  static async refreshSession(): Promise<void> {
    const currentSession = await SessionManager.getSession();
    
    if (!currentSession) {
      throw new Error('Aucune session active trouvée');
    }

    await SessionManager.updateSession({
      expires_at: new Date(Date.now() + SESSION_DURATION),
    });
  }


}
