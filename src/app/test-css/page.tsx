export default function TestCSS() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          CSS Test Page
        </h1>
        
        {/* Test basic Tailwind classes */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-4">Basic Tailwind Test</h2>
          <p className="text-gray-300">This should have a glass effect background.</p>
        </div>
        
        {/* Test custom CSS classes */}
        <div className="glass-card rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Custom CSS Test</h2>
          <p className="text-gray-300">This should use the custom glass-card class.</p>
        </div>
        
        {/* Test gradient text */}
        <div className="bg-black/20 rounded-lg p-6">
          <h2 className="text-2xl font-semibold gradient-text mb-4">Gradient Text Test</h2>
          <p className="text-gray-300">This text should have a gradient effect.</p>
        </div>
        
        {/* Test hover effects */}
        <div className="hover-glow bg-purple-600/20 rounded-lg p-6 cursor-pointer">
          <h2 className="text-2xl font-semibold text-white mb-4">Hover Effect Test</h2>
          <p className="text-gray-300">Hover over this card to see the glow effect.</p>
        </div>
        
        {/* Test vision card */}
        <div className="vision-card rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Vision Card Test</h2>
          <p className="text-gray-300">This should have the vision card styling.</p>
        </div>
        
        {/* Test tech typography */}
        <div className="bg-black/20 rounded-lg p-6">
          <h2 className="tech-heading text-white mb-4">Tech Heading Test</h2>
          <p className="tech-body text-gray-300">This should use the tech typography classes.</p>
        </div>
        
        {/* Test floating orbs */}
        <div className="relative h-32 bg-black/20 rounded-lg p-6 overflow-hidden">
          <div className="floating-orb absolute w-4 h-4 bg-purple-500 rounded-full opacity-60"></div>
          <div className="floating-orb absolute w-6 h-6 bg-blue-500 rounded-full opacity-60"></div>
          <div className="floating-orb absolute w-3 h-3 bg-indigo-500 rounded-full opacity-60"></div>
          <h2 className="text-2xl font-semibold text-white mb-4 relative z-10">Floating Orbs Test</h2>
          <p className="text-gray-300 relative z-10">You should see floating orbs in the background.</p>
        </div>
      </div>
    </div>
  );
} 