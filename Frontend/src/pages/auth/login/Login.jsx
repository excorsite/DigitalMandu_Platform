import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import InputField from "../../../components/common/InputField";
import { PrimaryButton } from "../../../components/common/Button";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useAuthStore();
  const [userData, setUserData] = useState({ userEmail: "", userPassword: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(userData);
      const role = res?._resolvedUser?.role || res?.data?.role;
      toast.success("Login successful");
      if (role === 'admin' || role === 'seller') navigate("/seller");
      else navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-yellow-50">
      <div className="bg-white w-11/12 lg:w-5/12 md:w-6/12 shadow-xl p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <form onSubmit={handleOnSubmit} className="space-y-4">
          <InputField label="Email" name="userEmail" type="text" value={userData.userEmail} onChange={handleChange} placeholder="Email" />
          <InputField label="Password" name="userPassword" type="password" value={userData.userPassword} onChange={handleChange} placeholder="Password" />
          <PrimaryButton label={loading ? "Loading..." : "Login"} type="submit" loading={loading} className="w-full justify-center" />
        </form>
        <p className="text-center text-sm mt-4">No account? <Link to="/register" className="text-green-600">Register</Link></p>
      </div>
    </div>
  );
};
export default Login;
