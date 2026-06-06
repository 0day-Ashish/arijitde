import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Advisory Strategy Booking - Schedule Call",
  description: "Book a strategic consultation call or advisory slot with Arijit De's wealth management advisory team.",
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return children;
}
