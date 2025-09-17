"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Login from "../../components/auth/login";
import SignUp from "../../components/auth/signUp";
import EmailSent from "../../components/auth/emailsent";
import ForgotPass from "../../components/auth/forgotPass";
import PassSetSuccess from "../../components/auth/passSetSuccess";
import SetNewPass from "../../components/auth/setNewPass";
import SignVerify from "../../components/auth/signVerify";
import PreLoading from "@/components/mask/preLoading";

const AuthContent = () => {

  const current = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!current.get("Collection")) {
      router.push("/auth?Collection=login");
    }
  }, [current, router]);

  return <>
    {current.get("Collection") === "login" && <Login />}
    {current.get("Collection") === "signUp" && <SignUp />}
    {current.get("Collection") === "emailSent" && <EmailSent />}
    {current.get("Collection") === "forgotPass" && <ForgotPass />}
    {current.get("Collection") === "passSetSuccess" && <PassSetSuccess />}
    {current.get("Collection") === "setNewPass" && <SetNewPass />}
    {current.get("Collection") === "signVerify" && <SignVerify />}
  </>
};

const Auth = () => {
  return (
    <Suspense fallback={<PreLoading />}>
      <AuthContent />
    </Suspense>
  );
};

export default Auth;
