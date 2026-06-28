export default function PortalPage() {
  return (
    <main className="min-h-screen bg-purple-50">
      <header className="bg-purple-800 text-white py-6 px-8">
        <h1 className="text-3xl font-bold">SI Portal</h1>
        <p className="text-purple-200 mt-1">portal.sigroup.com.bd</p>
      </header>
      <section className="max-w-4xl mx-auto px-8 py-16">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">Employee & Client Portal</h2>
        <p className="text-gray-600 text-lg mb-10">Secure access to SI Group services.</p>
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
          <h3 className="text-xl font-semibold mb-6 text-gray-700">Sign In</h3>
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button className="w-full bg-purple-700 text-white rounded-lg py-3 font-semibold hover:bg-purple-800 transition">
            Login
          </button>
        </div>
      </section>
    </main>
  )
}
