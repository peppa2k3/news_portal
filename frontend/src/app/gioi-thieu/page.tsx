import type { Metadata } from "next"; import { StaticPage } from "@/components/static/StaticPage";
export const metadata: Metadata = { title: "Giới thiệu" };
export default function Page() { return <StaticPage title="Giới thiệu"><p>News Portal cung cấp thông tin thời sự đáng tin cậy, được biên tập minh bạch và cập nhật liên tục. Chúng tôi ưu tiên tính chính xác, cân bằng và trách nhiệm với độc giả.</p><h2>Nguyên tắc biên tập</h2><p>Mọi nội dung đều trải qua quy trình tác giả, biên tập và xuất bản; sai sót được đính chính rõ ràng khi phát hiện.</p></StaticPage>; }
