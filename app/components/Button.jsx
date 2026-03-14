const variants = {
  primary:
    'px-8 py-[13px] bg-violet text-white font-head font-semibold text-[14px] tracking-[0.03em] rounded-md no-underline transition-[background,transform,box-shadow] duration-200 hover:bg-[#9070ff] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(124,92,255,0.35)] max-[640px]:text-center',
  secondary:
    'px-8 py-[13px] bg-transparent text-foreground font-head font-medium text-[14px] border border-ui rounded-md no-underline transition-[border-color,color,transform] duration-200 hover:border-mint hover:text-mint hover:-translate-y-0.5 max-[640px]:text-center',
  link:
    'flex items-center justify-center gap-2 px-7 py-[14px] border border-ui text-muted no-underline font-mono text-[13px] tracking-[0.05em] rounded-md transition-all duration-200 hover:border-mint hover:text-mint hover:-translate-y-0.5',
};

export default function Button({ href, variant = 'primary', className = '', children, ...props }) {
  const classes = `${variants[variant]} ${className}`.trim();

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
