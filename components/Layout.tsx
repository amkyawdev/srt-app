import Navigation from './Navigation';
import { FloatingBot } from './FloatingBot';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        {children}
      </main>
      <FloatingBot />
    </div>
  );
}