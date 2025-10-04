'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cloud, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { useEffect, useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const navItems = [
    { href: '/', label: 'Accueil' },
    { href: '/weather', label: 'Météo' },
    { href: '/calendar', label: 'Calendrier' },
    { href: '/events', label: 'Événements' },
    { href: '/pro', label: 'Pro' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-blue-500 group-hover:scale-110 transition-transform">
              <Cloud className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                XiineDay
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 -mt-1">
                Votre météo, vos décisions.
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? 'default' : 'ghost'}
                  className={
                    pathname === item.href
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                      : ''
                  }
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
