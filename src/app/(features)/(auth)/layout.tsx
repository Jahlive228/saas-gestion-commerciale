import GridShape from "@/components/common/GridShape";
import React from "react";
import AuthIllustration from "./_components/AuthIllustration";

export const metadata = {
  title: "Saas - Application de gestion de commerce",
  description: "Application de gestion de commerce",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col dark:bg-gray-900 sm:p-0">
        {children}
        <div className="lg:w-1/2 w-full h-full rounded-bl-4xl rounded-tl-4xl bg-gradient-to-br from-brand-950 via-brand-900 to-purple-950 dark:bg-white/5 lg:flex items-center justify-center hidden relative overflow-hidden">
          {/* Grid Pattern Background */}
          <GridShape />
          {/* Animated Illustration */}
          <AuthIllustration />
        </div>
      </div>
    </div>
  );
}
