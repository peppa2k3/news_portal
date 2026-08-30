import type { Metadata } from "next"; import { StaticPage } from "@/components/static/StaticPage";
export const metadata: Metadata = { title: "Chính sách bảo mật" };
export default function Page() { return <StaticPage title="Chính sách bảo mật"><p>Hệ thống chỉ thu thập dữ liệu cần thiết để vận hành, bảo mật và xử lý bình luận. Dữ liệu truy cập được giới hạn thời gian lưu và không bán cho bên thứ ba.</p><h2>Quyền của bạn</h2><p>Bạn có thể yêu cầu xem, sửa hoặc xóa dữ liệu cá nhân theo quy định áp dụng bằng cách liên hệ tòa soạn.</p></StaticPage>; }
