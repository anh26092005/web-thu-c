"use client";
import React, { useRef, useEffect, useState } from "react";

// Định nghĩa các interface cho dữ liệu info
export interface PortableTextSpan {
  _key: string;
  _type: "span";
  text: string;
  marks: string[];
}

export interface PortableTextMarkDef {
  _key: string;
  _type: string; // "link" hoặc khác
  href?: string;
}

export interface PortableTextBlock {
  _key: string;
  _type: "block";
  style: string;
  children: PortableTextSpan[];
  markDefs: PortableTextMarkDef[];
  listItem?: string;
  level?: number;
}

export interface IngredientRow {
  _key: string;
  _type: "ingredientRow";
  ingredientName: string;
  amount: string;
}

export interface CompositionSection {
  subtitle: string;
  ingredientsTable: IngredientRow[];
}

export interface OverdoseOrMissed {
  subtitle: string;
  content: PortableTextBlock[];
}

export interface OverdoseAndMissedDose {
  overdose: OverdoseOrMissed;
  missedDose: OverdoseOrMissed;
}

export interface SideEffects {
  title?: string;
  content: PortableTextBlock[];
}

export interface Storage {
  title?: string;
  content: PortableTextBlock[];
}

export interface UsageInstructions {
  title?: string;
  howToUse: {
    subtitle: string;
    content: PortableTextBlock[];
  };
  dosage: {
    subtitle: string;
    content: PortableTextBlock[];
  };
}

export interface UsageSection {
  title?: string;
  indications: {
    subtitle: string;
    content: PortableTextBlock[];
  };
  pharmacodynamics: {
    subtitle: string;
    content: PortableTextBlock[];
  };
  pharmacokinetics: {
    subtitle: string;
    content: PortableTextBlock[];
  };
}

export interface WarningsAndPrecautions {
  mainNoteTitle?: string;
  introText?: PortableTextBlock[];
  contraindications: {
    subtitle: string;
    content: PortableTextBlock[];
  };
  precautions: {
    subtitle: string;
    content: PortableTextBlock[];
  };
  drivingAndOperatingMachinery: {
    subtitle: string;
    content: PortableTextBlock[];
  };
  pregnancy: {
    subtitle: string;
    content: PortableTextBlock[];
  };
  breastfeeding: {
    subtitle: string;
    content: PortableTextBlock[];
  };
  drugInteractions: {
    subtitle: string;
    content: PortableTextBlock[];
  };
}

export interface ProductDrugInfo {
  drugName: string;
  compositionSection: CompositionSection;
  usageSection: UsageSection;
  usageInstructions: UsageInstructions;
  overdoseAndMissedDose: OverdoseAndMissedDose;
  sideEffects: SideEffects;
  storage: Storage;
  warningsAndPrecautions: WarningsAndPrecautions;
}

// Hàm render Portable Text đơn giản (chỉ hỗ trợ text, strong, em, link)
function renderPortableText(blocks: PortableTextBlock[] = []) {
  if (!blocks) return null;
  return blocks.map((block, idx) => {
    if (block._type !== "block") return null;
    return (
      <div key={block._key || idx} style={{ marginBottom: 8 }}>
        {block.children.map((span, i) => {
          let text: React.ReactNode = span.text;
          if (span.marks?.length) {
            span.marks.forEach((mark: string) => {
              if (mark === "strong") text = <strong key={i}>{text}</strong>;
              if (mark === "em") text = <em key={i}>{text}</em>;
            });
          }
          // Xử lý link
          const markDef = block.markDefs?.find((def) => def._key === span.marks?.[0]);
          if (markDef && markDef._type === "link") {
            text = (
              <a key={i} href={markDef.href} target="_blank" rel="noopener noreferrer" style={{ color: "#1976d2" }}>
                {text}
              </a>
            );
          }
          return text;
        })}
      </div>
    );
  });
}

const TABS = [
  { key: "compositionSection", label: "Thành phần" },
  { key: "usageSection", label: "Công dụng" },
  { key: "usageInstructions", label: "Cách dùng" },
  { key: "sideEffects", label: "Tác dụng phụ" },
  { key: "warningsAndPrecautions", label: "Lưu ý" },
  { key: "storage", label: "Bảo quản" },
];

interface Props {
  info: ProductDrugInfo;
}

const ProductInfo = ({ info }: Props) => {
  // Tạo ref cho từng section
  const sectionRefs = {
    compositionSection: useRef<HTMLDivElement>(null),
    usageSection: useRef<HTMLDivElement>(null),
    usageInstructions: useRef<HTMLDivElement>(null),
    sideEffects: useRef<HTMLDivElement>(null),
    warningsAndPrecautions: useRef<HTMLDivElement>(null),
    storage: useRef<HTMLDivElement>(null),
  };

  // State cho tab đang active
  const [activeTab, setActiveTab] = useState<string>("compositionSection");

  // State cho xem thêm/thu gọn
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Lấy vị trí từng section
      const offsets = TABS.map((t) => {
        const ref = sectionRefs[t.key as keyof typeof sectionRefs];
        if (!ref.current) return { key: t.key, offset: Infinity };
        // Lấy khoảng cách từ top viewport đến section
        const rect = ref.current.getBoundingClientRect();
        return { key: t.key, offset: Math.abs(rect.top - 80) }; // 80 là offset cho sticky header nếu có
      });
      // Tìm section gần nhất phía trên
      const min = offsets.reduce((prev, curr) => (curr.offset < prev.offset ? curr : prev), offsets[0]);
      setActiveTab(min.key);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Gọi lần đầu để set đúng tab khi load
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!info) return null;

  // Hàm scroll tới section
  const scrollToSection = (key: keyof typeof sectionRefs) => {
    setActiveTab(key);
    sectionRefs[key]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex bg-white rounded-xl p-5 max-md:pl-0">
      {/* Sidebar chỉ mục */}
      <div className="w-48 flex-shrink-0 sticky top-4 h-fit hidden md:block">
        <ul className="flex flex-col gap-2">
          {TABS.map((t) => (
            <li
              key={t.key}
              className={`cursor-pointer px-4 py-2 rounded font-medium text-xl text-gray-500 transition border-b-2 border-[#edf0f2]  ${
                activeTab === t.key ? "bg-[#edf0f2] font-bold text-blue-700 rounded-md text-gray-900" : "hover:bg-gray-100 hover:text-gray-900 rounded-md"
              }`}
              onClick={() => scrollToSection(t.key as keyof typeof sectionRefs)}
            >
              {t.label}
            </li>
          ))}
        </ul>
      </div>
      {/* Nội dung tất cả section */}
      <div className="flex-1 pl-8 relative">
        {/* Bọc toàn bộ nội dung trong 1 div để xử lý xem thêm/thu gọn */}
        <div
          style={
            expanded
              ? { maxHeight: "none", overflow: "visible" }
              : {
                  maxHeight: 350,
                  overflow: "hidden",
                  position: "relative",
                  transition: "max-height 0.3s",
                }
          }
        >
          {/* Thành phần */}
          <div ref={sectionRefs.compositionSection} id="compositionSection" className="mb-8 scroll-mt-24">
            <h2 className="font-bold text-xl mb-4">{info.drugName}</h2>
            <div className="text-gray-600/80 mb-4 font-semibold">{info.compositionSection?.subtitle}</div>
            <table className="lg:w-2/3 w-full mb-4 overflow-hidden rounded-md">
              <thead>
                <tr className="bg-gray-300 overflow-hidden rounded-full border-b-2 border-white">
                  <th className="p-2 pl-4 text-left">Thông tin thành phần</th>
                  <th className="p-2 pr-4 text-right border-l-2 border-white">Hàm lượng</th>
                </tr>
              </thead>
              <tbody>
                {info.compositionSection?.ingredientsTable?.map((row: IngredientRow) => (
                  <tr key={row._key} className="border-b-2 border-white bg-[#edf0f2]">
                    <td className="p-2 pl-4">{row.ingredientName}</td>
                    <td className="p-2 pr-4 text-right border-l-2 border-white">{row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Công dụng */}
          <div ref={sectionRefs.usageSection} id="usageSection" className="mb-8 scroll-mt-24">
            <h2 className="font-bold text-xl mb-4">{info.usageSection?.title}</h2>
            <h3 className="font-semibold mt-2 mb-3">{info.usageSection?.indications?.subtitle}</h3>
            {renderPortableText(info.usageSection?.indications?.content)}
            <h3 className="font-semibold mt-5 mb-3">{info.usageSection?.pharmacodynamics?.subtitle}</h3>
            {renderPortableText(info.usageSection?.pharmacodynamics?.content)}
            <h3 className="font-semibold mt-5 mb-3">{info.usageSection?.pharmacokinetics?.subtitle}</h3>
            {renderPortableText(info.usageSection?.pharmacokinetics?.content)}
          </div>
          {/* Cách dùng */}
          <div ref={sectionRefs.usageInstructions} id="usageInstructions" className="mb-8 scroll-mt-24">
            <h2 className="font-bold text-xl mb-4">{info.usageInstructions?.title}</h2>
            <h3 className="font-semibold mt-2 mb-3">{info.usageInstructions?.howToUse?.subtitle}</h3>
            {renderPortableText(info.usageInstructions?.howToUse?.content)}
            <h3 className="font-semibold mt-5 mb-3">{info.usageInstructions?.dosage?.subtitle}</h3>
            {renderPortableText(info.usageInstructions?.dosage?.content)}
            <h3 className="font-semibold mt-5 mb-3">Làm gì khi dùng quá liều?</h3>
            {renderPortableText(info.overdoseAndMissedDose?.overdose?.content)}
            <h3 className="font-semibold mt-5 mb-3">Làm gì khi quên 1 liều?</h3>
            {renderPortableText(info.overdoseAndMissedDose?.missedDose?.content)}
          </div>
          {/* Tác dụng phụ */}
          <div ref={sectionRefs.sideEffects} id="sideEffects" className="mb-8 scroll-mt-24">
            <h2 className="font-bold text-xl mb-4">{info.sideEffects?.title || "Tác dụng phụ"}</h2>
            {renderPortableText(info.sideEffects?.content)}
          </div>
          {/* Lưu ý */}
          <div ref={sectionRefs.warningsAndPrecautions} id="warningsAndPrecautions" className="mb-8 scroll-mt-24">
            <div className="bg-[#fff3e0] p-4 rounded-md mb-4">
              <div className="font-bold text-yellow-500 flex text-2xl items-center mt-1 mb-2">
                <span style={{ fontSize: 20, marginRight: 8 }}>⚠️</span>
                {info.warningsAndPrecautions?.mainNoteTitle || "Lưu ý"}
              </div>
              {renderPortableText(info.warningsAndPrecautions?.introText || [])}
              <div className="font-semibold mt-3 mb-4">{info.warningsAndPrecautions?.contraindications?.subtitle}</div>
              {renderPortableText(info.warningsAndPrecautions?.contraindications?.content)}
              <div className="font-semibold mt-5 mb-4">{info.warningsAndPrecautions?.precautions?.subtitle}</div>
              {renderPortableText(info.warningsAndPrecautions?.precautions?.content)}
              <div className="font-semibold mt-5 mb-4">{info.warningsAndPrecautions?.drivingAndOperatingMachinery?.subtitle}</div>
              {renderPortableText(info.warningsAndPrecautions?.drivingAndOperatingMachinery?.content)}
              <div className="font-semibold mt-5 mb-4">{info.warningsAndPrecautions?.pregnancy?.subtitle}</div>
              {renderPortableText(info.warningsAndPrecautions?.pregnancy?.content)}
              <div className="font-semibold mt-5 mb-4">{info.warningsAndPrecautions?.breastfeeding?.subtitle}</div>
              {renderPortableText(info.warningsAndPrecautions?.breastfeeding?.content)}
              <div className="font-semibold mt-5 mb-4">{info.warningsAndPrecautions?.drugInteractions?.subtitle}</div>
              {renderPortableText(info.warningsAndPrecautions?.drugInteractions?.content)}
            </div>
          </div>
          {/* Bảo quản */}
          <div ref={sectionRefs.storage} id="storage" className="mb-8 scroll-mt-24">
            <h2 className="font-bold text-xl mb-2">{info.storage?.title || "Bảo quản"}</h2>
            {renderPortableText(info.storage?.content)}
          </div>
          {/* Hiệu ứng mờ phía dưới khi chưa mở rộng */}
          {!expanded && (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 80,
                background: "linear-gradient(to top, #fff, rgba(255,255,255,0))",
                pointerEvents: "none",
              }}
            />
          )}
        </div>
        {/* Nút xem thêm/thu gọn */}
        <div className="flex justify-center mt-2 mb-4">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-2 text-base font-medium focus:outline-none"
          >
            {expanded ? (
              <>
                <span style={{ fontSize: 18 }}><i className="fi fi-br-chevron-double-up text-base text-xs"></i></span> Thu gọn
              </>
            ) : (
              <>
                <span style={{ fontSize: 18 }}><i className="fi fi-br-chevron-double-down text-base text-xs"></i></span> Xem thêm
              </>
            )}
          </button>
        </div>
         {/* Box cảnh báo cuối trang */}
         <div className="mt-2 mb-2 p-3 bg-blue-50 rounded-md flex items-center" style={{ borderLeft: "5px solid #1976d2" }}>
          <span className="text-blue-600 text-sm">
            Mọi thông tin trên đây chi mang tính chất tham khảo. Việc sử dụng thuốc phải tuân theo hướng dẫn của bác sĩ chuyên môn.
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
