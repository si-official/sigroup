export default function ShopPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-green-700 text-white py-6 px-8">
        <h1 className="text-3xl font-bold">SI Shop</h1>
        <p className="text-green-200 mt-1">shop.sigroup.com.bd</p>
      </header>
      <section className="max-w-6xl mx-auto px-8 py-16">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Products</h2>
        <p className="text-gray-600 text-lg">Browse our wide range of products.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow p-6">
              <div className="bg-gray-100 rounded-lg h-40 mb-4" />
              <h3 className="font-semibold text-gray-800">Product {i}</h3>
              <p className="text-green-600 font-bold mt-1">৳ 0.00</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
