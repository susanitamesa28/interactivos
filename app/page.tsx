import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Interactivos LMS
        </h1>

        <p className="mt-3 text-gray-600">
          Crea materiales interactivos para tus cursos.
        </p>

        <Link
          href="/new"
          className="mt-6 inline-flex rounded-md bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Nuevo interactivo
        </Link>
      </div>
    </main>
  );
}