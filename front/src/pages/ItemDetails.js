import React, { useEffect, useState } from "react";
import { useCart } from "../auth/CartContext";
import { Link } from "react-router-dom";

function FeaturedProducts() {
  const [itemList, setItemList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const { addToCart } = useCart();

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    fetch("https://buba-backend.onrender.com/items/getItems")
      .then((res) => res.json())
      .then((data) => setItemList(data))
      .catch((err) => console.error("Error fetching items:", err));
  }, []);

  const filteredItems =
    searchQuery.trim() === ""
      ? itemList
      : itemList?.filter((item) =>
          item.title?.toLowerCase().includes(searchQuery.toLowerCase()),
        );

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="mt-10">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Найти товар..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F86D72]"
        />
      </div>

      <h3 className="my-6">Каталог</h3>
      {message && (
        <div className="mb-4 p-3 rounded bg-green-100 text-green-700 text-center">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedItems?.length === 0 ? (
          <p className="text-gray-500 col-span-3 text-center">
            Товары не найдены
          </p>
        ) : (
          paginatedItems?.map((item) => (
            <div
              key={item._id}
              className="relative flex flex-col justify-between border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all h-full"
            >
              <Link to={`/itemDetails/${item?._id}`}>
                <div className="w-full aspect-square overflow-hidden rounded-lg">
                  <img
                    className="w-full h-full object-cover"
                    src={item.coverImage || "/placeholder.jpg"}
                    alt={item.title}
                    onError={(e) => {
                      e.target.src = "/placeholder.jpg";
                    }}
                  />
                </div>
                <h6 className="text-center my-3 min-h-[20px] line-clamp-2">
                  {item.title}
                </h6>
              </Link>

              <span className="text-gray-400">{item?.author}</span>
              <strong className="text-[#F86D72]">
                {item?.price?.toFixed(0) || 0} ₽
              </strong>
              <div className="text-sm text-gray-500">Остаток: {item.stock}</div>
            </div>
          ))
        )}
      </div>

      {/* Пагинация без стрелок — только номера страниц */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 mt-6 max-w-full overflow-x-auto">
          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-2 py-1 sm:px-3 sm:py-1 text-sm sm:text-base rounded min-w-[30px] ${
                  currentPage === page
                    ? "bg-[#F86D72] text-white"
                    : "hover:bg-gray-200"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FeaturedProducts;
