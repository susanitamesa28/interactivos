"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

type AuthMode = "login" | "register";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) {
    return null;
  }

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setMessage("");
    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setMessage("Escribe tu correo y contraseña.");
      return;
    }

    if (password.length < 6) {
      setMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    if (mode === "register") {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
        emailRedirectTo:
  typeof window === "undefined"
    ? undefined
    : window.location.href,        },
      });

      setIsLoading(false);

      if (error) {
        setMessage(error.message);
        return;
      }

      if (data.session) {
        setMessage("Cuenta creada e inicio de sesión realizado correctamente.");
        window.setTimeout(handleClose, 900);
        return;
      }

      setMessage(
        "Cuenta creada. Revisa tu correo y confirma tu dirección antes de iniciar sesión."
      );
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    setIsLoading(false);

    if (error) {
      setMessage("No fue posible iniciar sesión. Revisa tu correo y contraseña.");
      return;
    }

    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2
              id="auth-modal-title"
              className="text-xl font-bold text-gray-900"
            >
              {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Inicia sesión para guardar tus interactivos en la nube.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded p-1 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Cerrar ventana de acceso"
          >
            ×
          </button>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
              mode === "login"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Iniciar sesión
          </button>

          <button
            type="button"
            onClick={() => switchMode("register")}
            className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
              mode === "register"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Crear cuenta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="auth-email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Correo electrónico
            </label>

            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="nombre@correo.com"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Contraseña
            </label>

            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              placeholder="Mínimo 6 caracteres"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              disabled={isLoading}
              minLength={6}
              required
            />
          </div>

          {message && (
            <p
              role="status"
              className={`rounded-md px-3 py-2 text-sm ${
                message.startsWith("Cuenta creada")
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {isLoading
              ? "Procesando..."
              : mode === "login"
                ? "Iniciar sesión"
                : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-gray-500">
          Puedes usar el editor sin cuenta. La cuenta solo es necesaria para
          guardar proyectos en la nube.
        </p>
      </section>
    </div>
  );
}