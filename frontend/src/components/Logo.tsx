import React from "react";
import { Image, useBreakpointValue } from "@chakra-ui/react";
import i18n from "i18next";

interface LogoProps {
  h?: number | string | (string | number)[];
}

const Logo: React.FC<LogoProps> = ({ h }) => {
  const isRTL = i18n.dir() === "rtl";
  const isDesktop = useBreakpointValue({ base: false, md: true });
  const src = isDesktop
    ? (isRTL ? process.env.PUBLIC_URL + "/text-logo.png" : process.env.PUBLIC_URL + "/text-logo.png")
    : (isRTL ? process.env.PUBLIC_URL + "/text-logo.png" : process.env.PUBLIC_URL + "/text-logo.png");

  // Default responsive height if not provided (mobile -> desktop)
  const responsiveHeight = h || [28, 32, 36];

  return (
    <Image
      src={src}
      height={responsiveHeight}
      width="auto"
      objectFit="contain"
      alt="LDN Trade"
    />
  );
};

export default Logo;
