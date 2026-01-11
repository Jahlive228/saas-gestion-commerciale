import { Metadata } from "next";
import SignInForm from "./_components/SignInForm";

export const metadata: Metadata = {
  title: "Saas - Application de gestion de commerce | Sign In",
  description: "Page de connexion de Saas - Application de gestion de commerce",
};

export default function SignIn() {
  return <SignInForm />;
}
