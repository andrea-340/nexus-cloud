import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-6 text-center">
      <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 italic uppercase">
        Il tuo Cloud <br />
        <span className="text-primary underline">Professionale</span>
      </h1>
      <p className="text-slate-500 max-w-2xl mx-auto text-lg mb-10 font-medium">
        Gestisci file, palestra e finanze in un unico posto con una grafica
        moderna e veloce.
      </p>
      <Link
        href="/login"
        className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black italic hover:scale-105 transition-transform inline-block shadow-2xl"
      >
        INIZIA ORA
      </Link>
    </section>
  );
}
