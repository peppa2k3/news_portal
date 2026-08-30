import type { Metadata } from "next"; import { StaticPage } from "@/components/static/StaticPage";
export const metadata: Metadata = { title: "Liên hệ" };
export default function Page() { return <StaticPage title="Liên hệ"><p>Để gửi phản hồi về nội dung, hợp tác hoặc yêu cầu đính chính, vui lòng dùng địa chỉ email được công bố trong cấu hình tòa soạn. Không gửi mật khẩu hoặc thông tin nhạy cảm qua email.</p></StaticPage>; }
