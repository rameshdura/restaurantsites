import { useState } from 'react';
import Image from 'next/image';

type NavLink = {
  label: string;
  href: string;
};

type NavConfig = {
  brand?: {
    text?: string;
    link?: string;
    image?: {
      src: string;
      alt: string;
    };
  };
  links: NavLink[];
};

export default function ResponsiveNavConfigurable({ config }: { config: NavConfig }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            {config.brand?.image ? (
              <a href={config.brand?.link || "/"}>
                <Image
                  src={config.brand.image.src}
                  alt={config.brand.image.alt}
                  width={128}
                  height={32}
                  className="h-8 w-auto"
                />
              </a>
            ) : (
              <a href={config.brand?.link || "/"}>
                <span className="text-xl font-semibold">{config.brand?.text}</span>
              </a>
            )}
          </div>
          <div className="hidden md:block">
            <div className="flex space-x-4">
              {config.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-gray-500 hover:text-gray-900"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden ${
            isOpen ? 'block' : 'hidden'
          }`}
          id="mobile-menu"
        >
          <div className="pt-2 pb-3 space-y-1">
            {config.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}