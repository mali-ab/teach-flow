import { Link } from "react-router-dom";

import AuthLayout from "../../layouts/AuthLayout";

export default function Register() {
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
          Create Account
        </h2>

        <p
          className="
    text-gray-500
    mt-2
    "
        >
          Join TeachFlow today
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
            placeholder="Full Name"
          />

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

          <select
            className="
    w-full
    border
    rounded-xl
    px-4
    py-3
    "
          >
            <option>Student</option>

            <option>Teacher</option>
          </select>

          <button
            className="
    w-full
    bg-blue-600
    text-white
    py-3
    rounded-xl
    "
          >
            Create Account
          </button>
        </div>

        <p
          className="
    mt-6
    text-center
    text-gray-500
    "
        >
          Already have account?
          <Link
            to="/login"
            className="
    text-blue-600
    ml-2
    "
          >
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
