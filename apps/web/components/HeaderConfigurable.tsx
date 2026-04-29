import Link from 'next/link';
import Image from 'next/image';

type LogoConfig = {
  text?: string;
  link?: string;
};

type LogoImageConfig = {
  src: string;
  alt: string;
};

type NavLink = {
  label: string;
  href: string;
};

type HeaderConfig = {
  logo?: LogoConfig;
  logoImage?: LogoImageConfig;
  links?: NavLink[];
};

export default function HeaderConfigurable({ config }: { config: HeaderConfig }) {
  return (
    <header className="bg-white border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            {config.logoImage ? (
              <Link href={config.logo?.link || "/"}>
                <Image
                  src={config.logoImage.src}
                  alt={config.logoImage.alt}
                  width={128}
                  height={32}
                  className="h-8 w-auto"
                />
              </Link>
            ) : (
              <Link href={config.logo?.link || "/"}>
                <span className="text-xl font-semibold">{config.logo?.text}</span>
              </Link>
            )}
          </div>
          <div className="hidden md:block">
            <div className="flex space-x-4">
              {config.links?.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-500 hover:text-gray-900"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}