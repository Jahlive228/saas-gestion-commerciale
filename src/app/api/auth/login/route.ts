import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/server/auth/prisma-auth';
import { TokenService } from '@/server/auth/token.service';

/**
 * POST /api/auth/login
 * Endpoint de connexion qui retourne un token Bearer
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('[API /auth/login] ===== Début de la requête de connexion =====');
  
  try {
    console.log('[API /auth/login] Parsing du body de la requête...');
    const body = await request.json();
    console.log('[API /auth/login] Body reçu:', { email: body.email, passwordLength: body.password?.length });
    
    const { email, password } = body;

    if (!email || !password) {
      console.log('[API /auth/login] ❌ Email ou mot de passe manquant');
      return NextResponse.json(
        {
          success: false,
          error: 'Email et mot de passe requis',
        },
        { status: 400 }
      );
    }

    console.log('[API /auth/login] ✅ Email et mot de passe présents, début de l\'authentification...');
    console.log('[API /auth/login] Email:', email);

    // Authentifier l'utilisateur
    console.log('[API /auth/login] Appel de authenticateUser...');
    const authResult = await authenticateUser(email, password);
    console.log('[API /auth/login] Résultat de authenticateUser:', { 
      success: authResult.success, 
      error: authResult.success ? undefined : authResult.error,
      userId: authResult.success ? authResult.user.id : undefined
    });

    if (!authResult.success) {
      console.log('[API /auth/login] ❌ Authentification échouée:', authResult.error);
      return NextResponse.json(
        {
          success: false,
          error: authResult.error,
        },
        { status: 401 }
      );
    }

    console.log('[API /auth/login] ✅ Authentification réussie pour:', authResult.user.email);
    console.log('[API /auth/login] Création/mise à jour du token API pour userId:', authResult.user.id);

    // Créer ou mettre à jour le token API
    let token: string;
    try {
      token = await TokenService.createOrUpdateToken(authResult.user.id, 30);
      console.log('[API /auth/login] ✅ Token créé avec succès, longueur:', token.length);
    } catch (tokenError: any) {
      console.error('[API /auth/login] ❌ Erreur lors de la création du token:', tokenError);
      console.error('[API /auth/login] Stack:', tokenError.stack);
      return NextResponse.json(
        {
          success: false,
          error: 'Erreur lors de la création du token: ' + (tokenError.message || 'Erreur inconnue'),
        },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    console.log('[API /auth/login] ✅ Connexion réussie en', duration, 'ms');
    console.log('[API /auth/login] ===== Fin de la requête (succès) =====');

    // Retourner l'utilisateur avec le token
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: authResult.user.id,
          email: authResult.user.email,
          first_name: authResult.user.first_name,
          last_name: authResult.user.last_name,
          role: authResult.user.role,
          tenant_id: authResult.user.tenant_id,
          is_active: authResult.user.is_active,
        },
        token: token,
      },
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('[API /auth/login] ❌ ===== ERREUR CRITIQUE =====');
    console.error('[API /auth/login] Erreur après', duration, 'ms');
    console.error('[API /auth/login] Type d\'erreur:', error?.constructor?.name);
    console.error('[API /auth/login] Message:', error?.message);
    console.error('[API /auth/login] Stack:', error?.stack);
    console.error('[API /auth/login] Erreur complète:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    console.error('[API /auth/login] ===== FIN ERREUR =====');
    
    // Si l'erreur est "Unauthorized", retourner 401, sinon 500
    const statusCode = error?.message?.includes('Unauthorized') || error?.status === 401 ? 401 : 500;
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la connexion',
      },
      { status: statusCode }
    );
  }
}
