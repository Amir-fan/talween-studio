export default function SimplePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-800 mb-8">
            مرحباً بك في تلوين ستوديو
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            منصة تعليمية سحرية للأطفال
          </p>
          <div className="bg-white rounded-lg p-8 shadow-lg max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">اختبار الصفحة</h2>
            <p className="text-gray-600">
              إذا كنت ترى هذه الصفحة، فالمشكلة قد تم حلها!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
