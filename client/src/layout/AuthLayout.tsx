import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-gray-50 to-[#003B5C]/5 p-4 transition-colors duration-300">
      {children}
    </div>
  );
};

export default AuthLayout;
