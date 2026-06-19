import { useState } from "react";
import {
  EDITORIAL_IMAGE_PLACEHOLDER,
  resolveMediaUrl,
} from "@/lib/format";

type EditorialImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src"
> & {
  src: string;
  width?: number;
};

export function EditorialImage({
  src,
  width = 1400,
  alt = "",
  className = "",
  loading,
  ...rest
}: EditorialImageProps) {
  const [failed, setFailed] = useState(false);
  const resolved = failed
    ? EDITORIAL_IMAGE_PLACEHOLDER
    : resolveMediaUrl(src, width);

  return (
    <img
      {...rest}
      src={resolved}
      alt={alt}
      loading={loading}
      decoding="async"
      referrerPolicy="no-referrer-when-downgrade"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
