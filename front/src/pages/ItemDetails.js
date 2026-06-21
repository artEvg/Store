import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../auth/CartContext";
import { useAuth } from "../auth/AuthContext";

function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { addToCart } = useCart();

  // Реф для контейнера изображений (для слайдера)
  const imageContainerRef = useRef(null);

  // Состояния для слайдера
  const [touchStart, setTouchStart] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  useEffect(() => {
    fetch(`https://buba-backend.onrender.com/items/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setItem(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Ошибка при загрузке товара:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-44">
        <div className="w-10 h-10 border-4 border-[#F86D72] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Получаем все изображения (coverImage + additionalImages)
  const allImages = [item.coverImage, ...(item.additionalImages || [])].filter(
    (img) => img,
  );

  // Обработчики для слайдера
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!touchStart) return;
    const delta = touchStart - e.targetTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      if (delta > 0)
        setCurrentImageIndex((prev) =>
          prev === allImages.length - 1 ? 0 : prev + 1,
        );
      else
        setCurrentImageIndex((prev) =>
          prev === 0 ? allImages.length - 1 : prev - 1,
        );
      setTouchStart(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
    setIsDragging(false);
  };

  const handleMouseDown = (e) => {
    setDragStart(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!dragStart || !isDragging) return;
    const delta = dragStart - e.clientX;
    if (Math.abs(delta) > 50) {
      if (delta > 0)
        setCurrentImageIndex((prev) =>
          prev === allImages.length - 1 ? 0 : prev + 1,
        );
      else
        setCurrentImageIndex((prev) =>
          prev === 0 ? allImages.length - 1 : prev - 1,
        );
      setDragStart(null);
    }
  };

  const handleMouseUp = () => {
    setDragStart(null);
    setIsDragging(false);
  };

  const handleAddToCart = () => {
    if (!user) {
      setMessage("Пожалуйста, авторизуйтесь/зарегистрируйтесь");
      return;
    }

    if (user.role === "admin") {
      setMessage("Вы админ, у вас нет корзины");
      return;
    }

    if (!selectedSize && item.sizes?.length > 0) {
      setMessage("Выберите размер");
      return;
    }

    addToCart(item._id, selectedSize);
    setMessage(
      `Товар добавлен в корзину${selectedSize ? `, размер: ${selectedSize}` : ""}`,
    );
  };

  return (
    <div className="mt-20 max-w-6xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-center w-full">
          <div
            ref={imageContainerRef}
            className="relative w-full max-w-[500px] aspect-square cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              src={`https://buba-backend.onrender.com/images/${allImages[currentImageIndex]}`}
              alt={item?.title}
              className="w-full h-full object-cover rounded-lg shadow select-none pointer-events-none"
            />

            {allImages.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentImageIndex((prev) =>
                      prev === 0 ? allImages.length - 1 : prev - 1,
                    )
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-gray-300/50 hover:bg-gray-400/70 rounded-full transition-colors opacity-70"
                  aria-label="Предыдущее изображение"
                >
                  <svg
                    className="w-3.5 h-3.5 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <button
                  onClick={() =>
                    setCurrentImageIndex((prev) =>
                      prev === allImages.length - 1 ? 0 : prev + 1,
                    )
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-gray-300/50 hover:bg-gray-400/70 rounded-full transition-colors opacity-70"
                  aria-label="Следующее изображение"
                >
                  <svg
                    className="w-3.5 h-3.5 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {allImages.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        idx === currentImageIndex
                          ? "bg-[#F86D72] scale-125"
                          : "bg-gray-400 bg-opacity-50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-5 text-xl md:text-2xl font-semibold">
            {item?.title}
          </h3>
          <p className="text-lg text-gray-600 mb-2">{item.author}</p>
          <p className="text-gray-500 mb-4 leading-relaxed">
            {item.description}
          </p>
          <p className="text-2xl font-bold text-[#F86D72] mb-2">
            {item.price.toFixed(0)} ₽
          </p>

          <p
            className={`font-medium ${
              item?.stock > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {item?.stock > 0 ? `Доступно ${item?.stock}` : "Нет в наличии"}
          </p>

          {item.sizes && item.sizes.length > 0 && (
            <div className="mt-4">
              <span className="text-gray-700 font-medium">Размер:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                {item.sizes.map((size, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-1.5 border rounded-md text-sm transition-all w-full ${
                      selectedSize === size
                        ? "bg-[#F86D72] text-white border-[#F86D72]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-[#F86D72]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={!item || item.stock === 0}
            className="mt-7 whitespace-nowrap w-44 disabled:bg-gray-400 disabled:cursor-not-allowed bg-[#F86D72] text-white font-medium py-2 px-4 rounded-md transition-colors shadow-md hover:bg-[#E55A5F]"
          >
            {item?.stock === 0 ? "Нет в наличии" : "Добавить в корзину"}
          </button>

          {message && (
            <div className="mt-4 p-3 rounded bg-green-100 text-green-700 text-center">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ItemDetails;
