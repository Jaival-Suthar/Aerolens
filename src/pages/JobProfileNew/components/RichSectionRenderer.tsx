// import React from "react";
// import { BulletNode, RichSection } from "../types/richText.types";

// /* -------------------- Bullet List -------------------- */

// interface BulletListProps {
//   items: BulletNode[];
// }

// const BulletList: React.FC<BulletListProps> = ({ items }) => {
//   return (
//     <ul className="rich-bullets">
//       {items.map((item) => (
//         <li key={item.id}>
//           {item.text}

//           {item.children?.length ? (
//             <BulletList items={item.children} />
//           ) : null}
//         </li>
//       ))}
//     </ul>
//   );
// };

// /* -------------------- Renderer -------------------- */

// interface RichSectionRendererProps {
//   sections: RichSection[];
// }

// export const RichSectionRenderer: React.FC<RichSectionRendererProps> = ({
//   sections
// }) => {
//   if (!sections?.length) return null;

//   return (
//     <>
//       {sections.map((section) => {

//         /* ---------- Paragraph ---------- */
//         if (section.type === "paragraph") {
//           return (
//             <div key={section.content[0]?.id ?? crypto.randomUUID()}>
//               {section.content.map((p) => (
//                 <p
//                   key={p.id}
//                   className="rich-paragraph"
//                 >
//                   {p.text}
//                 </p>
//               ))}
//             </div>
//           );
//         }

//         /* ---------- Bullets ---------- */
//         if (section.type === "bullets") {
//           return (
//             <BulletList
//               key={section.content[0]?.id ?? crypto.randomUUID()}
//               items={section.content}
//             />
//           );
//         }

//         return null;
//       })}
//     </>
//   );
// };
