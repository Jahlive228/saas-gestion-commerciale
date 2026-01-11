import { Metadata } from "next";
import { Suspense } from "react";
import ResetPasswordForm from "./_components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Saas - Application de gestion de commerce | Reset Password",
  description: "Page de réinitialisation de mot de passe de Saas - Application de gestion de commerce",
};

export default function ResetPassword() {
  return 
  (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />;
    </Suspense>
  )
}
