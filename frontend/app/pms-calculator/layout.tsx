import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "PMS Calculator - Portfolio Management Returns Tracker",
  description: "Simulate target wealth compound returns for specialized high-net-worth portfolio management services (PMS).",
};

export default function PMSCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
