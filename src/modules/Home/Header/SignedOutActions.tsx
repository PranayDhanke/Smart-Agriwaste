"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { FiUser, FiPackage, FiShoppingBag } from "react-icons/fi";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function SignedOutActions() {
  const t = useTranslations("header");
  return (
    <>
      <Link href="/sign-in" className="hidden sm:block">
        <Button variant="outline" size="sm">
          {t("auth.login")}
        </Button>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <FiUser className="mr-1" />
            {t("auth.signup")}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-60">
          <Link href="/sign-up?role=farmer">
            <DropdownMenuItem>
              <FiPackage className="mr-2" /> {t("role.farmer")}
            </DropdownMenuItem>
          </Link>
          <Link href="/sign-up?role=buyer">
            <DropdownMenuItem>
              <FiShoppingBag className="mr-2" /> {t("role.buyer")}
            </DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
