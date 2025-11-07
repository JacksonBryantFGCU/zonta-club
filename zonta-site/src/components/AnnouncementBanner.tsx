// zonta-site/src/components/AnnouncementBanner.tsx

import { useAnnouncementBanner } from "../hooks/useAnnouncementBanner";

export default function AnnouncementBanner() {
  const { isVisible, dismiss, announcement } = useAnnouncementBanner();

  if (!isVisible || !announcement) {
    return null;
  }

  const hasLink = announcement.link && announcement.link.trim() !== "";

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-zontaGold text-white border-b-2 border-zontaRed">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            
            {hasLink ? (
              <a
                href={announcement.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium hover:underline flex-1"
              >
                {announcement.text}
              </a>
            ) : (
              <p className="text-sm font-medium flex-1">
                {announcement.text}
              </p>
            )}
          </div>

          <button
            onClick={dismiss}
            className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Dismiss announcement"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
