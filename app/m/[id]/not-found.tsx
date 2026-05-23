import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-[#111] text-white flex flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🤔</div>
        <h1 className="text-3xl font-black mb-2">Meme not found</h1>
        <p className="text-white/40 text-sm">
          This meme may have expired or never existed.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C8F135] text-black font-bold hover:bg-[#d4f54d] transition-colors shadow-lg shadow-[#C8F135]/20"
      >
        ✨ Make your own meme
      </Link>
    </div>
  );
}
