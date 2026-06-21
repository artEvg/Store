import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

function Allitems() {
  const [itemList, setItemList] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, isAdmin, user } = useAuth();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch(
          "https://buba-backend.onrender.com/admin/getItems",
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          },
        );

        if (res.status === 401 || res.status === 403) {
          setError("Not authorized");
          navigate("/", { replace: true });
          return;
        }

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        setItemList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching items:", error);
        setError(error.message);
        navigate("/", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && isAdmin) fetchItems();
    else {
      console.log("Not authenticated or not admin");
      navigate("/", { replace: true });
    }
  }, [navigate, isAuthenticated, isAdmin]);

  const handleDelete = async (itemId) => {
    if (!window.confirm("Вы действительно хотите удалить этот товар?")) return;

    try {
      const res = await fetch(
        `https://buba-backend.onrender.com/items/deleteItem/${itemId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || data.message || "Ошибка при удалении");
        return;
      }

      const data = await res.json();
      alert(data.message);
      setItemList(itemList.filter((item) => item._id !== itemId));
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Ошибка при удалении товара: " + error.message);
    }
  };

  const handleToggleVisibility = async (itemId, currentlyVisible) => {
    const newVisible = !currentlyVisible;
    const action = newVisible ? "отобразить" : "скрыть";

    try {
      const res = await fetch(
        `https://buba-backend.onrender.com/items/updateItem/${itemId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isFeatured: newVisible }),
        },
      );

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || data.message || "Ошибка");
        return;
      }

      const data = await res.json();
      alert(`Товар ${action} успешно`);

      setItemList(
        itemList.map((item) =>
          item._id === itemId ? { ...item, isFeatured: newVisible } : item,
        ),
      );
    } catch (error) {
      console.error("Error toggling visibility:", error);
      alert("Ошибка при изменении видимости: " + error.message);
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className="mt-1">
      <h3 className="my-3">Все товары</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-10">
        {itemList?.map((item) => (
          <div
            key={item._id}
            className="flex flex-col border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all h-full"
          >
            <a href={`/admin/update-item/${item?._id}`}>
              {/* ✅ ИСПРАВЛЕНО: теперь используем URL Cloudinary напрямую */}
              <img
                src={
                  item.coverImage ||
                  "https://via.placeholder.com/300x300?text=No+Image"
                }
                alt={item.title}
                className="w-full h-[300px] object-cover rounded-lg"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/300x300?text=No+Image";
                }}
              />

              <h6 className="my-3 min-h-[20px] line-clamp-2">{item?.title}</h6>

              <span className="text-gray-400">{item?.author}</span>

              <strong className="text-[#F86D72] mt-2">
                {item?.price.toFixed(0)} ₽
              </strong>
            </a>

            <div className="flex gap-2 mt-3">
              {/* Кнопка скрыть/показать (опционально) */}
              <button
                className={`px-4 py-2 rounded text-sm ${
                  item.isFeatured
                    ? "bg-yellow-500 text-white hover:bg-yellow-600"
                    : "bg-gray-500 text-white hover:bg-gray-600"
                }`}
                onClick={() =>
                  handleToggleVisibility(item._id, item.isFeatured)
                }
              >
                {item.isFeatured ? "Скрыть" : "Отобразить"}
              </button>

              <button
                className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                onClick={() => handleDelete(item._id)}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Allitems;
