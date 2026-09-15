export default function Home() {
  return (
    <main className="min-h-screen p-10">
      <h1 className="text-4xl font-bold mb-6">
        Interactivos LMS
      </h1>

      <a
        href="/new"
        className="inline-block bg-green-700 text-white px-4 py-2 rounded"
      >
        Nuevo interactivo
      </a>
    </main>
  );
}