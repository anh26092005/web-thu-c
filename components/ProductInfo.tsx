"use client";
import React, { useState } from "react";

// Hàm render Portable Text đơn giản (chỉ hỗ trợ text, strong, em, link)
function renderPortableText(blocks: any[]) {
  if (!blocks) return null;
  return blocks.map((block, idx) => {
    if (block._type !== "block") return null;
    return (
      <div key={block._key || idx} style={{ marginBottom: 8 }}>
        {block.children.map((span: any, i: number) => {
          let text = span.text;
          if (span.marks?.length) {
            span.marks.forEach((mark: string) => {
              if (mark === "strong") text = <strong key={i}>{text}</strong>;
              if (mark === "em") text = <em key={i}>{text}</em>;
              // Link xử lý ở dưới
            });
          }
          // Xử lý link
          const markDef = block.markDefs?.find((def: any) => def._key === span.marks?.[0]);
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
  info: any;
}

const ProductInfo = ({ info }: Props) => {
  const [tab, setTab] = useState("compositionSection");

  if (!info) return null;

  // Thành phần
  const renderComposition = () => (
    <div>
      <h2 className="font-bold text-xl mb-2">{info.drugName}</h2>
      <div className="text-gray-600 mb-2">{info.compositionSection?.subtitle}</div>
      <table className="w-full mb-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-left">Thông tin thành phần</th>
            <th className="p-2 text-left">Hàm lượng</th>
          </tr>
        </thead>
        <tbody>
          {info.compositionSection?.ingredientsTable?.map((row: any) => (
            <tr key={row._key} className="border-b">
              <td className="p-2">{row.ingredientName}</td>
              <td className="p-2">{row.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Công dụng
  const renderUsage = () => (
    <div>
      <h2 className="font-bold text-xl mb-2">{info.usageSection?.title}</h2>
      <h3 className="font-semibold mt-2 mb-1">{info.usageSection?.indications?.subtitle}</h3>
      {renderPortableText(info.usageSection?.indications?.content)}
      <h3 className="font-semibold mt-2 mb-1">{info.usageSection?.pharmacodynamics?.subtitle}</h3>
      {renderPortableText(info.usageSection?.pharmacodynamics?.content)}
      <h3 className="font-semibold mt-2 mb-1">{info.usageSection?.pharmacokinetics?.subtitle}</h3>
      {renderPortableText(info.usageSection?.pharmacokinetics?.content)}
    </div>
  );

  // Cách dùng
  const renderInstructions = () => (
    <div>
      <h2 className="font-bold text-xl mb-2">{info.usageInstructions?.title}</h2>
      <h3 className="font-semibold mt-2 mb-1">{info.usageInstructions?.howToUse?.subtitle}</h3>
      {renderPortableText(info.usageInstructions?.howToUse?.content)}
      <h3 className="font-semibold mt-2 mb-1">{info.usageInstructions?.dosage?.subtitle}</h3>
      {renderPortableText(info.usageInstructions?.dosage?.content)}
      <h3 className="font-semibold mt-2 mb-1">Làm gì khi dùng quá liều?</h3>
      {renderPortableText(info.overdoseAndMissedDose?.overdose?.content)}
      <h3 className="font-semibold mt-2 mb-1">Làm gì khi quên 1 liều?</h3>
      {renderPortableText(info.overdoseAndMissedDose?.missedDose?.content)}
    </div>
  );

  // Tác dụng phụ
  const renderSideEffects = () => (
    <div>
      <h2 className="font-bold text-xl mb-2">{info.sideEffects?.title || "Tác dụng phụ"}</h2>
      {renderPortableText(info.sideEffects?.content)}
    </div>
  );

  // Lưu ý
  const renderWarnings = () => {
    const w = info.warningsAndPrecautions;
    return (
      <div>
        <div className="bg-orange-100 p-4 rounded mb-4">
          <div className="font-bold text-orange-700 flex items-center mb-2">
            <span style={{ fontSize: 20, marginRight: 8 }}>⚠️</span>
            {w?.mainNoteTitle || "Lưu ý"}
          </div>
          {renderPortableText(w?.introText)}
          <div className="font-semibold mt-2 mb-1">{w?.contraindications?.subtitle}</div>
          {renderPortableText(w?.contraindications?.content)}
          <div className="font-semibold mt-2 mb-1">{w?.precautions?.subtitle}</div>
          {renderPortableText(w?.precautions?.content)}
          <div className="font-semibold mt-2 mb-1">{w?.drivingAndOperatingMachinery?.subtitle}</div>
          {renderPortableText(w?.drivingAndOperatingMachinery?.content)}
          <div className="font-semibold mt-2 mb-1">{w?.pregnancy?.subtitle}</div>
          {renderPortableText(w?.pregnancy?.content)}
          <div className="font-semibold mt-2 mb-1">{w?.breastfeeding?.subtitle}</div>
          {renderPortableText(w?.breastfeeding?.content)}
          <div className="font-semibold mt-2 mb-1">{w?.drugInteractions?.subtitle}</div>
          {renderPortableText(w?.drugInteractions?.content)}
        </div>
      </div>
    );
  };

  // Bảo quản
  const renderStorage = () => (
    <div>
      <h2 className="font-bold text-xl mb-2">{info.storage?.title || "Bảo quản"}</h2>
      {renderPortableText(info.storage?.content)}
    </div>
  );

  // Chọn tab để render
  const renderTabContent = () => {
    switch (tab) {
      case "compositionSection":
        return renderComposition();
      case "usageSection":
        return renderUsage();
      case "usageInstructions":
        return renderInstructions();
      case "sideEffects":
        return renderSideEffects();
      case "warningsAndPrecautions":
        return renderWarnings();
      case "storage":
        return renderStorage();
      default:
        return null;
    }
  };

  return (
    <div className="flex">
      {/* Sidebar tab */}
      <div className="w-48 flex-shrink-0">
        <ul className="flex flex-col gap-2">
          {TABS.map((t) => (
            <li
              key={t.key}
              className={`cursor-pointer px-4 py-2 rounded ${tab === t.key ? "bg-gray-100 font-bold" : "hover:bg-gray-50"}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </li>
          ))}
        </ul>
      </div>
      {/* Nội dung tab */}
      <div className="flex-1 pl-8">{renderTabContent()}</div>
    </div>
  );
};

export default ProductInfo;
