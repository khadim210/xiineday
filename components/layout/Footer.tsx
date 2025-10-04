import { Cloud, Github, Twitter } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-blue-500">
                <Cloud className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">XiineDay</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
              Votre compagnon météo intelligent pour planifier vos événements et optimiser vos activités agricoles.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-sm">Navigation</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/" className="hover:text-green-600 transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/weather" className="hover:text-green-600 transition-colors">
                  Météo
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-green-600 transition-colors">
                  Événements
                </Link>
              </li>
              <li>
                <Link href="/pro" className="hover:text-green-600 transition-colors">
                  Version Pro
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-sm">Suivez-nous</h3>
            <div className="flex gap-3">
              <a
                href="#"
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>&copy; 2025 XiineDay. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
