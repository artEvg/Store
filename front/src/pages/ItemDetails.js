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

  // Состояния для модального окна
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  // Порог для различения клика и перетаскивания (в пикселях)
  const SWIPE_THRESHOLD = 10;

  useEffect(() => {
    fetch(`https://buba-backend.onrender.com/items/${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ item loaded:", data);
        setItem(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Ошибка при загрузке товара:", err);
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

  // Все изображения
  const allImages = [item.coverImage, ...(item.additionalImages || [])].filter(
    (img) => img,
  );

  // ===== Обработчики для основной галереи =====
  const galleryTouchStart = useRef(null);
  const galleryTouchStartY = useRef(null);
  const galleryMouseStartX = useRef(null);
  const galleryMouseStartY = useRef(null);
  const isSwiping = useRef(false);

  // --- Touch события ---
  const handleGalleryTouchStart = (e) => {
    const touch = e.targetTouches[0];
    galleryTouchStart.current = touch.clientX;
    galleryTouchStartY.current = touch.clientY;
    isSwiping.current = false;
  };

  const handleGalleryTouchMove = (e) => {
    if (galleryTouchStart.current === null) return;
    const deltaX = galleryTouchStart.current - e.targetTouches[0].clientX;
    const deltaY = galleryTouchStartY.current - e.targetTouches[0].clientY;
    // Если движение значительное, считаем свайпом
    if (
      Math.abs(deltaX) > SWIPE_THRESHOLD ||
      Math.abs(deltaY) > SWIPE_THRESHOLD
    ) {
      isSwiping.current = true;
    }
    // Переключение слайда при горизонтальном свайпе
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX > 0) {
        setCurrentImageIndex((prev) =>
          prev === allImages.length - 1 ? 0 : prev + 1,
        );
      } else {
        setCurrentImageIndex((prev) =>
          prev === 0 ? allImages.length - 1 : prev - 1,
        );
      }
      galleryTouchStart.current = null; // сброс, чтобы не срабатывало повторно
      galleryTouchStartY.current = null;
    }
  };

  const handleGalleryTouchEnd = () => {
    // Если не было свайпа и есть изображения – открываем модалку
    if (!isSwiping.current && allImages.length > 0) {
      openModal(0);
    }
    galleryTouchStart.current = null;
    galleryTouchStartY.current = null;
    isSwiping.current = false;
  };

  // --- Mouse события ---
  const handleGalleryMouseDown = (e) => {
    galleryMouseStartX.current = e.clientX;
    galleryMouseStartY.current = e.clientY;
    isSwiping.current = false;
  };

  const handleGalleryMouseMove = (e) => {
    if (galleryMouseStartX.current === null) return;
    const deltaX = galleryMouseStartX.current - e.clientX;
    const deltaY = galleryMouseStartY.current - e.clientY;
    if (
      Math.abs(deltaX) > SWIPE_THRESHOLD ||
      Math.abs(deltaY) > SWIPE_THRESHOLD
    ) {
      isSwiping.current = true;
    }
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX > 0) {
        setCurrentImageIndex((prev) =>
          prev === allImages.length - 1 ? 0 : prev + 1,
        );
      } else {
        setCurrentImageIndex((prev) =>
          prev === 0 ? allImages.length - 1 : prev - 1,
        );
      }
      galleryMouseStartX.current = null;
      galleryMouseStartY.current = null;
    }
  };

  const handleGalleryMouseUp = (e) => {
    // Если не было движения (клик) – открываем модалку
    if (!isSwiping.current && allImages.length > 0) {
      // Проверяем, что кнопка мыши отпущена на том же элементе (чтобы не сработало при выносе)
      const rect = e.currentTarget.getBoundingClientRect();
      const isInside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (isInside) {
        openModal(0);
      }
    }
    galleryMouseStartX.current = null;
    galleryMouseStartY.current = null;
    isSwiping.current = false;
  };

  const handleGalleryMouseLeave = () => {
    // Сбрасываем, чтобы при выносе мыши не открывалась модалка
    galleryMouseStartX.current = null;
    galleryMouseStartY.current = null;
    isSwiping.current = false;
  };

  // ===== Обработчики для модального окна =====
  const openModal = (index) => {
    setModalImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImageIndex(0);
  };

  const handlePrevModalImage = (e) => {
    if (e) e.stopPropagation();
    setModalImageIndex((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1,
    );
  };

  const handleNextModalImage = (e) => {
    if (e) e.stopPropagation();
    setModalImageIndex((prev) =>
      prev === allImages.length - 1 ? 0 : prev + 1,
    );
  };

  // Обработчики для модального окна (свайп + клик по изображению закрывает? нет, лучше не закрывать при клике, оставим как есть)
  // Но добавим различение клика и свайпа для модалки, чтобы при перетаскивании не закрывалось.
  const modalTouchStart = useRef(null);
  const modalTouchStartY = useRef(null);
  const modalMouseStartX = useRef(null);
  const modalMouseStartY = useRef(null);
  const modalIsSwiping = useRef(false);

  const handleModalTouchStart = (e) => {
    const touch = e.targetTouches[0];
    modalTouchStart.current = touch.clientX;
    modalTouchStartY.current = touch.clientY;
    modalIsSwiping.current = false;
  };

  const handleModalTouchMove = (e) => {
    if (modalTouchStart.current === null) return;
    const deltaX = modalTouchStart.current - e.targetTouches[0].clientX;
    const deltaY = modalTouchStartY.current - e.targetTouches[0].clientY;
    if (
      Math.abs(deltaX) > SWIPE_THRESHOLD ||
      Math.abs(deltaY) > SWIPE_THRESHOLD
    ) {
      modalIsSwiping.current = true;
    }
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX > 0) handleNextModalImage();
      else handlePrevModalImage();
      modalTouchStart.current = null;
      modalTouchStartY.current = null;
    }
  };

  const handleModalTouchEnd = () => {
    // Если не свайп и клик внутри изображения – ничего не делаем, оставляем открытым
    // Но если хотите закрывать по клику на пустое место – это обрабатывается на внешнем оверлее
    modalTouchStart.current = null;
    modalTouchStartY.current = null;
    modalIsSwiping.current = false;
  };

  const handleModalMouseDown = (e) => {
    modalMouseStartX.current = e.clientX;
    modalMouseStartY.current = e.clientY;
    modalIsSwiping.current = false;
  };

  const handleModalMouseMove = (e) => {
    if (modalMouseStartX.current === null) return;
    const deltaX = modalMouseStartX.current - e.clientX;
    const deltaY = modalMouseStartY.current - e.clientY;
    if (
      Math.abs(deltaX) > SWIPE_THRESHOLD ||
      Math.abs(deltaY) > SWIPE_THRESHOLD
    ) {
      modalIsSwiping.current = true;
    }
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX > 0) handleNextModalImage();
      else handlePrevModalImage();
      modalMouseStartX.current = null;
      modalMouseStartY.current = null;
    }
  };

  const handleModalMouseUp = (e) => {
    // Если не было свайпа, ничего не делаем (не закрываем)
    modalMouseStartX.current = null;
    modalMouseStartY.current = null;
    modalIsSwiping.current = false;
  };

  const handleModalMouseLeave = () => {
    modalMouseStartX.current = null;
    modalMouseStartY.current = null;
    modalIsSwiping.current = false;
  };

  // ===== Корзина =====
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

  // ===== Рендер =====
  return (
    <>
      <div className="mt-20 max-w-6xl mx-auto px-6">
        {item ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start bg-white shadow-md rounded-lg p-6">
            {/* Галерея */}
            <div className="flex justify-center w-full">
              <div
                className="relative w-full max-w-[500px] aspect-square cursor-zoom-in bg-gray-50 rounded-lg overflow-hidden select-none"
                onTouchStart={handleGalleryTouchStart}
                onTouchMove={handleGalleryTouchMove}
                onTouchEnd={handleGalleryTouchEnd}
                onMouseDown={handleGalleryMouseDown}
                onMouseMove={handleGalleryMouseMove}
                onMouseUp={handleGalleryMouseUp}
                onMouseLeave={handleGalleryMouseLeave}
              >
                {allImages.length > 0 ? (
                  <img
                    src={`https://buba-backend.onrender.com/images/${allImages[currentImageIndex]}`}
                    alt={item?.title}
                    className="w-full h-full object-cover rounded-lg shadow pointer-events-none"
                    onError={(e) => {
                      console.error(
                        "⚠️ Ошибка загрузки изображения:",
                        e.target.src,
                      );
                      e.target.src =
                        "https://via.placeholder.com/500x500?text=No+Image";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center rounded-lg bg-gray-100">
                    <span className="text-gray-400">Нет изображений</span>
                  </div>
                )}

                {/* Стрелки и индикаторы (если >1 изображения) */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex((prev) =>
                          prev === 0 ? allImages.length - 1 : prev - 1,
                        );
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-gray-300/50 hover:bg-gray-400/70 rounded-full transition-colors opacity-70"
                      aria-label="Предыдущее"
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex((prev) =>
                          prev === allImages.length - 1 ? 0 : prev + 1,
                        );
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-gray-300/50 hover:bg-gray-400/70 rounded-full transition-colors opacity-70"
                      aria-label="Следующее"
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
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
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

            {/* Информация о товаре */}
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
        ) : (
          <div className="mt-44 text-center">
            <p className="text-xl text-gray-500">Товар не найден</p>
          </div>
        )}
      </div>

      {/* Модальное окно */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
          onClick={closeModal} // закрытие по клику на оверлей
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-gray-300 transition-colors z-50"
            aria-label="Закрыть"
          >
            ×
          </button>

          <div
            className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()} // не даем закрыться при клике внутри
            onTouchStart={handleModalTouchStart}
            onTouchMove={handleModalTouchMove}
            onTouchEnd={handleModalTouchEnd}
            onMouseDown={handleModalMouseDown}
            onMouseMove={handleModalMouseMove}
            onMouseUp={handleModalMouseUp}
            onMouseLeave={handleModalMouseLeave}
          >
            <button
              onClick={handlePrevModalImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-gray-800/50 hover:bg-gray-700/70 rounded-full transition-colors text-white"
              aria-label="Предыдущее"
            >
              <svg
                className="w-6 h-6"
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

            <img
              src={`https://buba-backend.onrender.com/images/${allImages[modalImageIndex]}`}
              alt={item?.title}
              className="max-w-full max-h-[80vh] object-contain rounded shadow-2xl pointer-events-none"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/500x500?text=No+Image";
              }}
            />

            <button
              onClick={handleNextModalImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-gray-800/50 hover:bg-gray-700/70 rounded-full transition-colors text-white"
              aria-label="Следующее"
            >
              <svg
                className="w-6 h-6"
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

            <div className="mt-4 flex gap-3">
              {allImages.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                    idx === modalImageIndex
                      ? "bg-[#F86D72] scale-125"
                      : "bg-white bg-opacity-50 hover:bg-opacity-70"
                  }`}
                  onClick={() => setModalImageIndex(idx)}
                  aria-label={`Перейти к ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ItemDetails;
