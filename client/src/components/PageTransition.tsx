import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Envolve o conteúdo de uma página com animação suave de entrada (fade + slide up).
 * Use em todas as páginas para transições consistentes.
 */
export default function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <div className={`animate-page-enter ${className}`}>
      {children}
    </div>
  );
}
