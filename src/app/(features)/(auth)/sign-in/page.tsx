import { Metadata } from "next";
import SignInForm from "./_components/SignInForm";

export const metadata: Metadata = {
  title: "Conect Cards Dashboard | Sign In",
  description: "Page de connexion de conect cards dashboard",
};

export default function SignIn() {
  return <SignInForm />;
}
