export default function WelcomeMessage() {
  return (
    <div className="flex items-center justify-center h-full max-h-full">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-light text-gray-800">
          Xin chào
        </h1>
        <p className="text-xl md:text-3xl text-gray-600 mt-6 font-light">
          Tôi có thể giúp gì cho bạn?
        </p>
        <div className="w-16 h-px bg-gray-300 mx-auto mt-8"></div>
      </div>
    </div>
  );
}