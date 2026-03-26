import type { ReactNode } from 'react';

interface AuthLayoutProps {
 children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
 return (
 <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 transition-colors duration-200">
 {children}
 </div>
 );
};

export default AuthLayout;
