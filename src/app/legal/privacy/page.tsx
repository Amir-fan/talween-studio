export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">سياسة الخصوصية</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            نحن في تلوين ستوديو نحترم خصوصيتك ونلتزم بحماية معلوماتك الشخصية.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. المعلومات التي نجمعها</h2>
          <p className="text-gray-600 mb-6">
            نجمع المعلومات التي تقدمها لنا مباشرة عند التسجيل، مثل البريد الإلكتروني والاسم.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. كيفية استخدام المعلومات</h2>
          <p className="text-gray-600 mb-6">
            نستخدم معلوماتك لتقديم خدماتنا، وتحسين تجربتك، والتواصل معك حول حسابك.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. مشاركة المعلومات</h2>
          <p className="text-gray-600 mb-6">
            لا نبيع أو نشارك معلوماتك الشخصية مع أطراف ثالثة دون موافقتك الصريحة.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. حماية البيانات</h2>
          <p className="text-gray-600 mb-6">
            نستخدم تقنيات أمنية متقدمة لحماية معلوماتك من الوصول غير المصرح به.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. حقوقك</h2>
          <p className="text-gray-600 mb-6">
            يمكنك طلب الوصول إلى معلوماتك أو حذفها أو تصحيحها في أي وقت.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. التحديثات</h2>
          <p className="text-gray-600 mb-6">
            قد نقوم بتحديث هذه السياسة من وقت لآخر. يرجى مراجعة هذه الصفحة بانتظام.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. الاتصال بنا</h2>
          <p className="text-gray-600 mb-6">
            إذا كان لديك أي أسئلة حول سياسة الخصوصية، يرجى التواصل معنا عبر البريد الإلكتروني
            <a href="mailto:hello@talween.com" className="text-primary underline mx-1">hello@talween.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
