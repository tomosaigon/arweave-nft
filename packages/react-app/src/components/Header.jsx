import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/tomosaigon/arweave-nft" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="Weavable"
        subTitle="ASCII Art on Arweave"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
