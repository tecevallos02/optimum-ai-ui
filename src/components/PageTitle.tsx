'use client';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function PageTitle({ title, subtitle, className = "" }: PageTitleProps) {
  return (
    <div className={`text-center py-6 ${className}`}>
      <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
      {subtitle && (
        <p className="text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
