const containers = {
  narrow:     'max-w-3xl mx-auto px-[60px] max-[640px]:px-10 py-[100px] max-[640px]:py-16',
  default:    'max-w-[1720px] mx-auto px-[60px] max-[640px]:px-10 py-[100px] max-[640px]:py-16',
  wide:       'max-w-6xl mx-auto px-[60px] max-[640px]:px-10 py-[100px] max-[640px]:py-16',
  fullscreen:                               'py-[100px] max-[640px]:py-16',
};

/**
 * Section
 *
 * <Section>…</Section>
 * <Section size="narrow" className="bg-bg2">…</Section>
 * <Section size="wide" id="projects">…</Section>
 * <Section size="fullscreen" className="bg-bg2">…</Section>
 *
 * Props:
 *   size               – 'narrow' | 'default' | 'wide' | 'fullscreen'  (default: 'default')
 *   id                 – forwarded to the <section> tag for anchor links
 *   className          – applied to the <section> tag  (bg-*, border-*, relative, etc.)
 *   style              – inline styles on the <section> tag
 *   containerClassName – extra classes merged onto the inner container div
 *   children           – section content
 */
export default function Section({
  size = 'default',
  id,
  className = '',
  style,
  containerClassName = '',
  children,
}) {
  return (
    <section id={id} className={className} style={style}>
      <div className={`${containers[size]} ${containerClassName}`}>
        {children}
      </div>
    </section>
  );
}
