export function canAccesDashboard(
  isLoggin: boolean, 
  isPublicRoute: boolean,
) {
  if (isLoggin && isPublicRoute) {
    return true;
  } else {
    return false;
  }
}



export function shouldRedirectToLogin(
  isLoggin: boolean, 
  isProtected: boolean
) {
  if (!isLoggin && isProtected) {
    return true;
  } else {
    return false;
  }
}

export function shouldRedirectToUnthaurizedRole(
  isLoggin: boolean, 
  hasRole: boolean,
) {
  if (!isLoggin && !hasRole) {
    return true;
  } else {
    return false;
  }
}

export function shouldRedirectToUnthaurizedPermission(
  isLoggin: boolean, 
  hasPermission: boolean,
) {
  if (!isLoggin && !hasPermission) {
    return true;
  } else {
    return false;
  }
}



