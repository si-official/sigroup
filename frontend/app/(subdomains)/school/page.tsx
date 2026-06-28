export default function SchoolPage() {
  return (
    <main className="min-h-screen bg-yellow-50">
      <header className="bg-yellow-700 text-white py-6 px-8">
        <h1 className="text-3xl font-bold">SI School</h1>
        <p className="text-yellow-200 mt-1">school.sigroup.com.bd</p>
      </header>
      <section className="max-w-6xl mx-auto px-8 py-16">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">Education Portal</h2>
        <p className="text-gray-600 text-lg">Empowering students with quality education.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {['Classes', 'Teachers', 'Results'].map((item) => (
            <div key={item} className="bg-white rounded-xl shadow p-8 text-center">
              <h3 className="text-xl font-semibold text-yellow-700">{item}</h3>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
