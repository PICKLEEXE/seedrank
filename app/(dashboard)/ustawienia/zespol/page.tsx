import { Users } from "lucide-react";

export default function ZespolPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team</h1>
        <p className="text-gray-500 text-sm mt-1">Manage team members</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
        <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Available from the Beginner plan</p>
        <a href="/ustawienia/platnosci" className="inline-block mt-4 text-sm text-green-600 hover:underline">
          Upgrade plan →
        </a>
      </div>
    </div>
  );
}
