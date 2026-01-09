import { Metadata } from "next";
import { Suspense } from "react";
import ResetPasswordForm from "./_components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Conect Cards Dashboard | Reset Password",
  description: "Page de réinitialisation de mot de passe de conect cards dashboard",
};

export default function ResetPassword() {
  return 
  (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />;
    </Suspense>
  )
}
