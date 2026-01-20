import React from "react";
import { BulletNode, RichSection } from "../types/jobProfileTypes";

const BulletList: React.FC<{ items: BulletNode[] }> = ({ items }) => {
  return (
    <ul style={{ paddingLeft: "1.2rem" }}>
      {items.map(item => (
        <li key={item.id}>
          {item.text}
          {item.children && <BulletList items={item.children} />}
        </li>
      ))}
    </ul>
  );
};

export const RichSectionRenderer: React.FC<{ sections: RichSection[] }> = ({
  sections
}) => {
  return (
    <>
      {sections.map((section, idx) => {
        if (section.type === "paragraph") {
          return section.content.map(p => (
            <p key={p.id} style={{ marginBottom: "0.75rem" }}>
              {p.text}
            </p>
          ));
        }

        return (
          <BulletList
            key={idx}
            items={section.content}
          />
        );
      })}
    </>
  );
};
