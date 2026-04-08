"use client";

import { useSignIn } from "@clerk/nextjs";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";

export default function SigninPage() {
  const { signIn, errors, fetchStatus } = useSignIn();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSignin = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const { error } = await signIn.password({
      emailAddress: emailAddress,
      password,
    });
    if (error) {
      setError(error.message);
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session?.currentTask);
            return;
          }

          // If no session tasks, navigate the signed-in user to the home page
          const url = decorateUrl("/");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url);
          }
        },
      });
    }
  };

   return (
     <div className="flex items-center justify-center min-h-screen bg-background">
       <Card className="w-full max-w-md">
         <CardHeader>
           <CardTitle className="text-2xl font-bold text-center">
             Sign In to Todo Master
           </CardTitle>
         </CardHeader>
         <CardContent>
           <form onSubmit={handleSignin} className="space-y-4">
             <div className="space-y-2">
               <Label htmlFor="email">Email</Label>
               <Input
                 type="email"
                 id="email"
                 value={emailAddress}
                 onChange={(e) => setEmailAddress(e.target.value)}
                 required
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="password">Password</Label>
               <div className="relative">
                 <Input
                   type={showPassword ? "text" : "password"}
                   id="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   required
                 />
                 <button
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute right-2 top-1/2 -translate-y-1/2">
                   {showPassword ? (
                     <EyeOff className="h-4 w-4 text-gray-500" />
                   ) : (
                     <Eye className="h-4 w-4 text-gray-500" />
                   )}
                 </button>
               </div>
             </div>
             {error && (
               <Alert variant="destructive">
                 <AlertDescription>{error}</AlertDescription>
               </Alert>
             )}
             <Button type="submit" className="w-full">
               Sign In
             </Button>
           </form>
         </CardContent>
         <CardFooter className="justify-center">
           <p className="text-sm text-muted-foreground">
             Don&apos;t have an account?{" "}
             <Link
               href="/sign-up"
               className="font-medium text-primary hover:underline">
               Sign up
             </Link>
           </p>
         </CardFooter>
       </Card>
     </div>
   );

}
