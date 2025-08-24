import { ColoringSection } from './coloring-section';

export default function CreateWithWordPage() {
  return (
    <div className="container mx-auto px-4 py-12 sm:py-16">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold text-foreground">
          حوّل الكلمات إلى فن
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
        اكتب كلمة أو جملة مثل "فارس يركب تنيناً في الفضاء" ودع الذكاء الاصطناعي يحولها إلى رسمة رائعة جاهزة للتلوين.
        </p>
      </div>
      <ColoringSection />
    </div>
  );
}
