import type { Metadata } from "next"; import { StaticPage } from "@/components/static/StaticPage";
export const metadata: Metadata = { title: "Điều khoản sử dụng" };
export default function Page() { return <StaticPage title="Điều khoản sử dụng"><p>Khi sử dụng website, bạn đồng ý không phát tán nội dung trái pháp luật, spam, mã độc hoặc xâm phạm quyền của người khác. Việc trích dẫn cần ghi rõ nguồn và tuân thủ quyền tác giả.</p></StaticPage>; }
