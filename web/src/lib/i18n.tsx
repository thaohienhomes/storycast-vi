import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type UiLang = "en" | "vi";
const KEY = "storycast-ui-lang";

const VI: Record<string, string> = {
  // header
  Home: "Trang chủ",
  Create: "Tạo phim",
  Explore: "Khám phá",
  "Connect fal key": "Kết nối fal key",
  Key: "Key",
  "Remove the key from this browser": "Xoá key khỏi trình duyệt này",
  // hero
  "{n} narrators ready to tell your story": "{n} người dẫn chuyện sẵn sàng kể chuyện cho bạn",
  "· or invent your own": "· hoặc tự tạo nhân vật",
  "Type a topic.": "Gõ một chủ đề.",
  "Get a story.": "Nhận một câu chuyện.",
  "Pick a character and give it a topic. It tells the story in its own voice, scene by scene, and you get back a finished animated story to watch and share.":
    "Chọn nhân vật và đưa cho nó một chủ đề. Nhân vật sẽ tự kể bằng giọng của mình, từng cảnh một, và bạn nhận về một phim hoạt hình hoàn chỉnh để xem và chia sẻ.",
  "Start a story": "Bắt đầu kể chuyện",
  "Browse stories": "Xem các câu chuyện",
  // create form
  Topic: "Chủ đề",
  "How do bees make honey?": "Ong làm mật như thế nào?",
  "Give the film a topic first": "Hãy nhập chủ đề cho phim trước",
  "An image is still uploading": "Ảnh vẫn đang tải lên",
  "Upload your character first": "Hãy tải nhân vật của bạn lên trước",
  Length: "Độ dài",
  "{n} languages": "{n} ngôn ngữ",
  Language: "Ngôn ngữ",
  "Search languages…": "Tìm ngôn ngữ…",
  "No language found.": "Không tìm thấy ngôn ngữ.",
  Popular: "Phổ biến",
  "All languages": "Tất cả ngôn ngữ",
  Voice: "Giọng đọc",
  "{name}'s voice": "Giọng của {name}",
  "{voice} · pick another any time": "{voice} · đổi giọng bất cứ lúc nào",
  "Pick another any time": "Đổi giọng bất cứ lúc nào",
  "Make the film": "Làm phim",
  Starting: "Đang bắt đầu",
  Rolling: "Đang quay",
  "A film is in production; new ones wait in line.": "Một phim đang sản xuất; phim mới sẽ xếp hàng chờ.",
  "{who} · {style} · {m} min · ready in about {r} min": "{who} · {style} · {m} phút · xong sau khoảng {r} phút",
  "Your own style": "Phong cách của bạn",
  "Your character": "Nhân vật của bạn",
  "A new character": "Một nhân vật mới",
  About: "Khoảng",
  "on your fal key": "trên fal key của bạn",
  Character: "Nhân vật",
  "{n} narrators, each with their own look and voice": "{n} người dẫn chuyện, mỗi người một ngoại hình và giọng riêng",
  min: "phút",
  All: "Tất cả",
  Animals: "Động vật",
  "Kids & teens": "Trẻ em & thiếu niên",
  "Grown-ups": "Người lớn",
  Elders: "Người già",
  "Robots & more": "Robot & khác",
  "Find a character": "Tìm nhân vật",
  "Invent one": "Tự tạo",
  "A new character for your topic, in any look": "Nhân vật mới theo chủ đề, với bất kỳ phong cách nào",
  "Your own": "Của bạn",
  "Upload a character, we redraw it": "Tải nhân vật lên, AI vẽ lại",
  "Make a film": "Làm một bộ phim",
  "Pick a topic, a look and a voice. The rest is directed for you.": "Chọn chủ đề, phong cách và giọng đọc. Phần còn lại AI đạo diễn giúp bạn.",
};

// Topic ideas shown under the topic field, per UI language.
export const IDEAS: Record<UiLang, string[]> = {
  en: ["Why is the sky blue?", "How do bees make honey?", "The first photograph", "How do volcanoes work?"],
  vi: ["Vì sao bầu trời màu xanh?", "Sự tích bánh chưng bánh giày", "Vì sao có mưa phùn nồm ẩm?", "Trống đồng Đông Sơn"],
};

function initial(): UiLang {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "vi" || saved === "en") return saved;
  } catch {}
  return typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("vi") ? "vi" : "en";
}

type Ctx = { lang: UiLang; setLang: (l: UiLang) => void; t: (s: string, vars?: Record<string, string | number>) => string };
const I18n = createContext<Ctx | null>(null);

function fill(s: string, vars?: Record<string, string | number>) {
  return vars ? s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`)) : s;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<UiLang>(initial);
  const setLang = useCallback((l: UiLang) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {}
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const t = useCallback((s: string, vars?: Record<string, string | number>) => fill(lang === "vi" ? (VI[s] ?? s) : s, vars), [lang]);
  return <I18n.Provider value={{ lang, setLang, t }}>{children}</I18n.Provider>;
}

export function useT() {
  const ctx = useContext(I18n);
  if (!ctx) return { lang: "en" as UiLang, setLang: () => {}, t: (s: string, v?: Record<string, string | number>) => fill(s, v) };
  return ctx;
}
