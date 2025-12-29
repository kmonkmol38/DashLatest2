export const Footer = () => {
  return (
    <footer className="py-6 px-4 mt-8">
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Created by <span className="font-bold text-foreground">ALI</span> - 
          <a 
            href="mailto:m.nharakkat@" 
            className="text-neon-cyan hover:text-neon-cyan/80 transition-colors ml-1"
          >
            m.nharakkat@
          </a>
          <span className="mx-2">–</span>
          <span className="text-muted-foreground">2025</span>
        </p>
      </div>
    </footer>
  );
};
