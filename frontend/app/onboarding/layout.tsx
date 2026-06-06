import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Get Started & Login",
  description: "Register a user account, verify access via OTP, or sign in to the premium client advisory cockpit.",
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
