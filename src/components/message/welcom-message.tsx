export default function WelcomeMessage() {
  return (
    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -mt-32 z-0">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-light text-gray-800">
          Xin chào
        </h1>
        <p className="text-xl md:text-3xl text-gray-600 mt-6 font-light">
          Tôi có thể giúp gì cho bạn?
        </p>
      </div>
    </div>
  );
}