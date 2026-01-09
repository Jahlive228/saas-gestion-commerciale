import { Metadata } from "next";
import ForgotPasswordForm from "./_components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "GomboPay - Mot de passe oublié",
  description: "Page de demande de réinitialisation de mot de passe de GomboPay",
};

export default function ForgotPassword() {
  return <ForgotPasswordForm />;
}
