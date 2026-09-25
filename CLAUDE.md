# CLAUDE.md — Storycast Việt (storycast-vi)

Bản Việt hoá của [ilkerzg/storycast](https://github.com/ilkerzg/storycast): gõ một chủ đề → nhận một phim hoạt hình có người dẫn chuyện (kịch bản, hình, giọng, nhạc, phụ đề), tất cả chạy trên fal.
Chủ dự án: Hien (solo founder Pho.Chat, không có nền tảng kỹ thuật, giao việc code cho Claude). Trao đổi với Hien bằng tiếng Việt, ngắn gọn.

## Trạng thái hiện tại (2026-09-25)

- Repo: `thaohienhomes/storycast-vi`, nhánh `main`. Upstream gốc: `ilkerzg/storycast` @ `b387466`.
- Deploy: Vercel, **Root Directory = `web`**, tự deploy khi push lên `main`. Không cần biến môi trường.
- Đã làm:
  - `61c70e2` UI tiếng Việt cho trang chủ, trang tạo phim, chọn nhân vật; nút chuyển VI/EN; ngôn ngữ phim mặc định theo ngôn ngữ UI; luật riêng cho tiếng Việt trong prompt đạo diễn; giữ dấu tiếng Việt trên tấm tiêu đề cuối phim.
  - `7c292bc` Việt hoá toàn bộ UI còn lại (~300 chuỗi) + dữ liệu (50 nhân vật, 26 phong cách, 74 tên ngôn ngữ); `web/vercel.json` để link sâu (`/create`, `/films/:id`) không 404.
- Chưa làm thật: chưa render phim tiếng Việt nào để kiểm tra giọng, dấu, giá vốn.

## Cách chạy

```bash
cd web
npm install
npm run dev        # http://localhost:5173
npx tsc -b && npm run lint && npm run build   # chạy trước mỗi lần push
```

Người dùng tự nhập fal key trong app (nút "Kết nối fal key"); key chỉ nằm trong trình duyệt. Không bao giờ commit key.

## Kiến trúc (web/ là site tĩnh Vite + React 19 + Tailwind 4)

- `src/lib/studio/pipeline.ts` — toàn bộ quy trình làm phim (class `Film`): kịch bản → nhân vật + keyframe → giọng → shot video/lip-sync → nhạc → dựng, mix, tấm tiêu đề, phụ đề. `endCardPrompt()` nhận `lang`.
- `src/lib/studio/director.ts` — prompt cho Claude (qua `openrouter/router` trên fal): `directorSystem()`, `continuity()`, `resizeLine()`, `translate()`. Luật tiếng Việt nằm ở biến `local` trong `directorSystem()`.
- `src/lib/studio/fal.ts` — gọi fal bằng key của người dùng. `voices.ts` — giọng ElevenLabs, nghe thử, kiểm tra giọng có hợp ngôn ngữ.
- `src/lib/studio/cost.ts` — ước tính chi phí (`estimateCost`), hiển thị trên form.
- `src/lib/studio/data.ts` — tải `public/data/config.json` (nhân vật, phong cách, ngôn ngữ), `films.json` (94 phim mẫu), `cache.json`.
- `share/` — Cloudflare Worker (D1 + R2) cho chia sẻ/Khám phá/thư viện giọng. **Chưa deploy**; không có nó thì nút chia sẻ và thư viện giọng bị ẩn/rỗng.

## i18n (quan trọng khi sửa UI)

- `src/lib/i18n.tsx`: `I18nProvider` + `useT()` → `{ t, lang, setLang }`. `t("Chuỗi tiếng Anh gốc", { n: 3 })` trả bản Việt khi `lang === "vi"`. Ngôn ngữ UI lưu trong localStorage `storycast-ui-lang`, mặc định theo `navigator.language`.
- Từ điển UI: object `VI` trong `i18n.tsx`. Dữ liệu từ config.json (tính cách nhân vật, tên/mô tả/nhóm phong cách, tên ngôn ngữ): `VI_DATA` trong `src/lib/i18n-data.ts`.
- Quy tắc: chuỗi hằng ở cấp module giữ tiếng Anh, bọc `t()` lúc render. Giá trị gửi lên server/dùng làm key logic giữ nguyên tiếng Anh. Mọi chuỗi UI mới phải có mục trong `VI` (hoặc `VI_DATA`).
- Cố ý để tiếng Anh: tên/phụ đề 94 phim mẫu, log kỹ thuật có biến trong `pipeline.ts`, `lib/agent.ts` (prompt cho coding agent), câu mẫu đọc bằng giọng trong `voices.ts`.

## Kinh tế (theo `cost.ts`, giá fal)

| Độ dài | Giá vốn Full |
| --- | --- |
| 1 phút | ~$6,2 |
| 3 phút | ~$23 |
| 5 phút | ~$38 |

Video (MiniMax H3, $0,08/giây) chiếm ~75%. Ý tưởng bản **Lite** (ảnh động + giọng + nhạc, không video AI): ~$1–1,5/phút — chưa đo, chưa làm.

## Vấn đề mở / rủi ro

1. **License**: repo gốc KHÔNG có file LICENSE → tác giả giữ toàn quyền. Chưa được thu tiền cho tới khi xin phép ilkerzg hoặc tự viết lại pipeline (ví dụ bên trong Pho.Chat). 50 nhân vật + ảnh cũng thuộc repo gốc.
2. **Giọng Việt**: 50 nhân vật dùng giọng Anh/Mỹ → đọc tiếng Việt bị lơ lớ. Cần chọn 6–8 giọng Việt (Bắc/Nam, nam/nữ, trẻ/già) từ thư viện ElevenLabs và gán mặc định khi `lang === "vi"`.
3. **Dấu trên tấm tiêu đề** do AI vẽ có thể sai; dự phòng: chèn chữ bằng font thật qua ffmpeg.

## Việc tiếp theo (theo thứ tự)

1. Render 3 phim tiếng Việt thật (1 phút) → kiểm tra giọng, dấu, giá vốn; ghi kết quả vào file này.
2. Giọng Việt mặc định khi ngôn ngữ phim là `vi`.
3. Bản Lite (bỏ bước video AI, dùng `images-to-video` + Ken Burns) để có gói miễn phí/giá rẻ.
4. Bộ nhân vật Việt riêng (thay nhân vật của repo gốc).
5. Watermark + khung cuối "Làm bằng Pho.Chat" + link giới thiệu.
6. Tích hợp vào Pho.Chat (credit trong ví) — xem phương án kinh doanh.

Phương án kinh doanh & go-to-market (Claude Docs): https://claude.ai/code/artifact/31c5197f-029b-4e3e-8cfd-4d8fa8a49243

## Quy ước làm việc

- Mỗi thay đổi: chạy `tsc -b`, `lint`, `build` trước khi commit; push lên `main` là lên production.
- Commit message tiếng Anh, ngắn, mô tả việc đã làm.
- Không đổi model/endpoint fal hay bảng giá mà không nói với Hien (ảnh hưởng trực tiếp tới chi phí).
- Khi thay đổi lớn, cập nhật mục "Trạng thái hiện tại" và "Việc tiếp theo" trong file này.
