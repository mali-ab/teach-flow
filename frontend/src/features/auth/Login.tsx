import { Link } from "react-router-dom";

import AuthLayout from "../../layouts/AuthLayout";

export default function Login() {
  return (
    <AuthLayout>
      <div
        className="
    bg-white
    p-8
    rounded-2xl
    shadow
    w-full
    max-w-md
    "
      >
        <h2
          className="
    text-3xl
    font-bold
    "
        >
          Welcome Back
        </h2>

        <p
          className="
    text-gray-500
    mt-2
    "
        >
          Login to your account
        </p>

        <div
          className="
    mt-8
    space-y-4
    "
        >
          <input
            className="
    w-full
    border
    rounded-xl
    px-4
    py-3
    "
            placeholder="Email"
          />

          <input
            type="password"
            className="
    w-full
    border
    rounded-xl
    px-4
    py-3
    "
            placeholder="Password"
          />

          <button
            className="
    w-full
    bg-blue-600
    text-white
    py-3
    rounded-xl
    hover:bg-blue-700
    "
          >
            Login
          </button>
        </div>

        <p
          className="
    mt-6
    text-center
    text-gray-500
    "
        >
          Don't have an account?
          <Link
            to="/register"
            className="
    text-blue-600
    ml-2
    "
          >
            Register
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
