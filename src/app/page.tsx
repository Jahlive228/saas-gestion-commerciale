import GridShape from "@/components/common/GridShape";
import Button from "@/components/ui/button/Button";
import { routes } from "@/config/routes";
import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
      <GridShape />
      <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
        <h1 className="mb-8 font-bold text-gray-800 text-title-md xl:text-title-xl">
          Bienvenue sur GomboPay Admin
        </h1>

        <p className="mt-10 mb-6 text-base text-gray-700 sm:text-lg">
          Connectez vous pour accéder à votre espace personnel.
        </p>

        <Link href={{ pathname: routes.auth.signin }}>
            <Button>Connexion</Button>
        </Link>

      </div>
      {/* <!-- Footer --> */}
      <p className="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2">
        &copy; {new Date().getFullYear()} - GomboPay
      </p>
    </div>
  );
}
