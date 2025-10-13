import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-100 pt-12 pb-6">
      <div className="container mx-auto w-full max-w-[1200px]">
        <div className="mb-8 grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-bold">Về chúng tôi</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-blue-500">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-blue-500">
                  Cách hoạt động
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-blue-500">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-blue-500">
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-bold">Hỗ trợ</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-blue-500">
                  Trung tâm trợ giúp
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-blue-500">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-blue-500">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-blue-500">
                  Chính sách hoàn tiền
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-bold">Đối tác</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-blue-500">
                  Đăng ký khách sạn
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-blue-500">
                  Đăng ký đối tác du lịch
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-blue-500">
                  Affiliate Marketing
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-blue-500">
                  Đối tác thanh toán
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-lg font-bold">Kết nối với chúng tôi</h3>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-600 hover:text-blue-500">
                <Facebook size={20} />
              </Link>
              <Link href="#" className="text-gray-600 hover:text-blue-500">
                <Instagram size={20} />
              </Link>
              <Link href="#" className="text-gray-600 hover:text-blue-500">
                <Twitter size={20} />
              </Link>
              <Link href="#" className="text-gray-600 hover:text-blue-500">
                <Youtube size={20} />
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-6">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} travelbooking.com. Tất cả các quyền được bảo lưu.Sản phẩm
            được tạo bởi nhóm WDP301_SE1833_NJ_GROUP-5
          </p>
        </div>
      </div>
    </footer>
  );
}
