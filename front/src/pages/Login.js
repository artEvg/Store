import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const result = await login(form);

      if (!result.success) {
        throw new Error(result.error || "Ошибка входа");
      }

      navigate(result.user?.role === "admin" ? "/admin" : "/", {
        replace: true,
      });
    } catch (error) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 mt-40 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Вход</h1>
      <form className="mt-50" onSubmit={onSubmit}>
        <input
          className="w-full border p-2 rounded mb-6"
          placeholder="Почта"
          name="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
        />
        <input
          className="w-full border p-2 rounded mb-6"
          placeholder="Пароль"
          name="password"
          type="password"
          value={form.password}
          onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
        />
        {err && <p className="text-red-500 text-sm text-center">{err}</p>}
        <div className="flex justify-center">
          <button disabled={loading}>{loading ? "..." : "Войти"}</button>
        </div>
      </form>
    </div>
  );
}

export default Login;
