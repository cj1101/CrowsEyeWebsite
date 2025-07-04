export default function TestCSSPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          CSS Test Page
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tailwind Classes Test */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Tailwind CSS Test
            </h2>
            <div className="space-y-4">
              <div className="bg-blue-500 text-white p-4 rounded">
                Blue background with white text
              </div>
              <div className="bg-green-500 text-white p-4 rounded">
                Green background with white text
              </div>
              <div className="bg-red-500 text-white p-4 rounded">
                Red background with white text
              </div>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors">
                Hover me
              </button>
            </div>
          </div>

          {/* Custom CSS Classes Test */}
          <div className="glass-card rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Custom CSS Test
            </h2>
            <div className="space-y-4">
              <div className="gradient-text text-2xl font-bold">
                Gradient Text
              </div>
              <div className="tech-heading text-white">
                Tech Heading
              </div>
              <div className="tech-body text-gray-300">
                This is tech body text with custom styling.
              </div>
              <div className="vision-button px-4 py-2 inline-block">
                Vision Button
              </div>
            </div>
          </div>

          {/* Dark Mode Test */}
          <div className="bg-gray-800 dark:bg-gray-900 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Dark Mode Test
            </h2>
            <p className="text-gray-300">
              This should have dark styling applied.
            </p>
          </div>

          {/* Animation Test */}
          <div className="bg-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Animation Test
            </h2>
            <div className="floating-orb w-8 h-8 bg-purple-500 rounded-full mx-auto"></div>
            <div className="floating-orb w-6 h-6 bg-blue-500 rounded-full mx-auto mt-4"></div>
            <div className="floating-orb w-4 h-4 bg-indigo-500 rounded-full mx-auto mt-4"></div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="mt-8 bg-black bg-opacity-50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">
            CSS Status
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
              <span className="text-white text-sm">Tailwind CSS</span>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
              <span className="text-white text-sm">Custom CSS</span>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
              <span className="text-white text-sm">Animations</span>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
              <span className="text-white text-sm">Dark Mode</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 