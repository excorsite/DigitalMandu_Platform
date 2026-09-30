import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import InputField from "../../../components/common/InputField";
import { PrimaryButton } from "../../../components/common/Button";
import toast from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useAuthStore();
  const [userData, setUserData] = useState({ userName: "", userPhone: "", userEmail: "", userPassword: "" });
  const handleChange = (e) => setUserData({ ...userData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(userData);
      toast.success("Registered successfully");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-yellow-50">
      <div className="bg-white w-11/12 lg:w-5/12 md:w-6/12 shadow-xl p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField label="Username" name="userName" value={userData.userName} onChange={handleChange} placeholder="Username" />
          <InputField label="Email" name="userEmail" value={userData.userEmail} onChange={handleChange} placeholder="Email" />
          <InputField label="Phone" name="userPhone" value={userData.userPhone} onChange={handleChange} placeholder="Phone" />
          <InputField label="Password" name="userPassword" type="password" value={userData.userPassword} onChange={handleChange} placeholder="Password" />
          <PrimaryButton label={loading ? "Loading..." : "Register"} type="submit" loading={loading} className="w-full justify-center" />
        </form>
        <p className="text-center text-sm mt-4">Already have account? <Link to="/login" className="text-green-600">Login</Link></p>
      </div>
    </div>
  );
};
export default Register;
