import React from "react";
import { Image, useBreakpointValue } from "@chakra-ui/react";
import i18n from "i18next";

interface LogoProps {
  h?: number | string | (string | number)[];
}

const Logo: React.FC<LogoProps> = ({ h }) => {
  const isRTL = i18n.dir() === "rtl";

  // Choose the actual image URL per breakpoint
  const src = useBreakpointValue({
    base: isRTL
      ? process.env.PUBLIC_URL + "/logo.png"
      : process.env.PUBLIC_URL + "/logo.png",
    md: isRTL
      ? process.env.PUBLIC_URL + "/text-logo.png"
      : process.env.PUBLIC_URL + "/text-logo.png",
  });

  // Default responsive height (base, md, lg)
  const responsiveHeight = h || [28, 32, 36];

  return (
    <Image
      src={src}
      height={responsiveHeight}
      width="auto"
      objectFit="contain"
      alt="InfiniProfits"
    />
  );
};

export default Logo;
