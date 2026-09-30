import { assets } from "../../assets/assets";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-green-footer border-t-4 border-primary mt-12">
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <img src={assets.logo} alt="Vintage Bite" className="h-8 mb-3" />
          <p className="text-sm text-gray-600 max-w-xs">
            Choose from a diverse menu featuring a delectable array of dishes
            crafted with the finest ingredients.
          </p>
          <div className="flex gap-3 mt-4">
            <span
              aria-label="Facebook"
              role="img"
              className="h-8 w-8 rounded-full border border-green-border bg-white flex items-center justify-center text-[#1877F2]"
            >
              <FaFacebookF aria-hidden="true" />
            </span>
            <span
              aria-label="Instagram"
              role="img"
              className="h-8 w-8 rounded-full border border-green-border bg-white flex items-center justify-center text-[#E4405F]"
            >
              <FaInstagram aria-hidden="true" />
            </span>
            <span
              aria-label="TikTok"
              role="img"
              className="h-8 w-8 rounded-full border border-green-border bg-white flex items-center justify-center text-gray-900"
            >
              <FaTiktok aria-hidden="true" />
            </span>
          </div>
        </div>
        <div>
          <h4 className="font-semibold font-serif text-gray-900 mb-3">
            Company
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>Home</li>
            <li>About us</li>
            <li>Delivery</li>
            <li>Privacy policy</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold font-serif text-gray-900 mb-3">
            Get in touch
          </h4>
          <p className="text-sm text-gray-600">+1-212-456-7890</p>
          <p className="text-sm text-gray-600">contact@vintagebite.com</p>
          <div className="flex gap-3 mt-4">
            <img
              src={assets.play_store}
              alt="Play Store"
              className="h-10 cursor-pointer"
            />
            <img
              src={assets.app_store}
              alt="App Store"
              className="h-10 cursor-pointer"
            />
          </div>
        </div>
      </div>
      <div className="border-t border-green-border py-4 text-center text-sm text-gray-600">
        © 2024 Vintage Bite. All rights reserved.
      </div>
    </footer>
  );
}
