import { Share2 } from "lucide-react";

export default function SocialPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Social Media</h1>
        <p className="text-gray-500 text-sm mt-1">Publikuj treści w mediach społecznościowych</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
        <Share2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Wkrótce dostępne</p>
        <p className="text-gray-400 text-sm mt-1">
          Automatyczne publikowanie w mediach społecznościowych już wkrótce.
        </p>
      </div>
    </div>
  );
}
