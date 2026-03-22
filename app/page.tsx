import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col flex-1 items-center justify-center min-h-screen px-4 py-16 bg-gray-50">
      <div className="max-w-xl w-full text-center flex flex-col items-center gap-6">
        {/* Logo / Brand */}
        <div className="text-6xl">🖨️</div>
        <h1 className="text-4xl font-bold text-gray-900 leading-tight">
          Calculadora de<br />
          <span className="text-orange-500">Impresión 3D</span>
        </h1>
        <p className="text-gray-600 text-lg max-w-md">
          Sube tu archivo <span className="font-mono font-semibold">.STL</span> o{' '}
          <span className="font-mono font-semibold">.3MF</span>, elige material y calidad,
          y obtén tu cotización en segundos.
        </p>

        <Link
          href="/calculadora"
          className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xl py-4 px-10 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          Calcular precio →
        </Link>

        <p className="text-sm text-gray-400 mt-2">
          Powered by{' '}
          <a
            href="https://fill-3d.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-400 hover:underline"
          >
            Fill-3D.com
          </a>{' '}
          · Colombia
        </p>
      </div>
    </main>
  );
}
