"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return <SignIn signUpUrl="/signup" />;
}
