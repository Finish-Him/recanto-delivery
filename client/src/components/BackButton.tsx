import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
  variant?: "default" | "ghost" | "outline";
}

export default function BackButton({
  to,
  label = "Voltar",
  className = "",
  variant = "ghost",
}: BackButtonProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    if (to) {
      setLocation(to);
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      setLocation("/");
    }
  };

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleBack}
      className={`flex items-center gap-1.5 font-semibold ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Button>
  );
}
