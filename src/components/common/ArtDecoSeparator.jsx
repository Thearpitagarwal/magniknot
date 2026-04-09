export default function ArtDecoSeparator({ accent = '#FDA4AF' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-6">
      <div className="h-px w-16" style={{ background: `linear-gradient(90deg, transparent, ${accent})` }} />
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
      <div className="h-px w-16" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
    </div>
  );
}
