interface HeadingProps {
  smallTitle?: string;
  mainTitle: string;
}

export default function Heading({ smallTitle, mainTitle }: HeadingProps) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">{smallTitle}</p>
      <h2 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">{mainTitle}</h2>
    </div>
  );
}
