export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">سياسة ملفات تعريف الارتباط</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            تستخدم تلوين ستوديو ملفات تعريف الارتباط (Cookies) لتحسين تجربتك في استخدام الموقع.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">ما هي ملفات تعريف الارتباط؟</h2>
          <p className="text-gray-600 mb-6">
            ملفات تعريف الارتباط هي ملفات نصية صغيرة يتم تخزينها على جهازك عند زيارة موقعنا.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">كيف نستخدمها؟</h2>
          <p className="text-gray-600 mb-6">
            نستخدم ملفات تعريف الارتباط لتذكر تفضيلاتك، وتحسين أداء الموقع، وتوفير تجربة شخصية.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">أنواع ملفات تعريف الارتباط</h2>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>ملفات تعريف الارتباط الأساسية: ضرورية لعمل الموقع</li>
            <li>ملفات تعريف الارتباط الوظيفية: تحسن تجربة المستخدم</li>
            <li>ملفات تعريف الارتباط التحليلية: تساعدنا في فهم كيفية استخدام الموقع</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">إدارة ملفات تعريف الارتباط</h2>
          <p className="text-gray-600 mb-6">
            يمكنك إدارة ملفات تعريف الارتباط من خلال إعدادات متصفحك. يرجى ملاحظة أن تعطيلها قد يؤثر على وظائف الموقع.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">التحديثات</h2>
          <p className="text-gray-600 mb-6">
            قد نقوم بتحديث هذه السياسة من وقت لآخر. يرجى مراجعة هذه الصفحة بانتظام.
          </p>
        </div>
      </div>
    </div>
  );
}
