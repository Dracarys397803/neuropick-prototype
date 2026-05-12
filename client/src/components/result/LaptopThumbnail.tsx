/**
 * LaptopThumbnail —— 笔记本电脑产品缩略图 (SVG)
 *
 * 不依赖外部图片,纯 SVG 绘制:
 *   - 上盖屏幕(带屏幕反光高光、屏幕内可选品牌字母 / emoji 图标)
 *   - 底座(键盘开口 + 触控板示意)
 *   - 投影
 *
 * 用 product.accent 这个 HSL 色彩 token 渲染屏幕底色,
 * 让 7 款笔记本在视觉上能彼此区分,但整体风格保持统一(电商产品卡式)。
 *
 * size 控制整体宽度,默认 96(用于 Top 3 大卡),RankedListItem 用 56。
 */

type Props = {
  /** HSL 三元字符串,不带 hsl() 包装。如 "210 8% 60%" */
  accent: string;
  /** 屏幕中央的标识 —— 1-2 字符品牌缩写 / emoji */
  badge?: string;
  /** 整体宽度(像素),高度按比例算 */
  size?: number;
  className?: string;
};

export function LaptopThumbnail({ accent, badge, size = 96, className = "" }: Props) {
  const w = size;
  const h = Math.round(size * 0.72);
  const accentStr = `hsl(${accent})`;
  // 屏幕底色用更深的 accent
  const screenBg = `hsl(${accent} / 0.92)`;
  // 屏幕边框稍亮
  const bezel = `hsl(${accent} / 0.4)`;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: w, height: h }}
      aria-hidden
    >
      <svg
        viewBox="0 0 120 86"
        width={w}
        height={h}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        {/* 阴影 */}
        <ellipse
          cx="60"
          cy="80"
          rx="44"
          ry="3"
          fill="hsl(0 0% 0% / 0.12)"
          filter="blur(1px)"
        />

        {/* 屏幕上盖外壳 */}
        <rect
          x="18"
          y="6"
          width="84"
          height="56"
          rx="3.2"
          fill={bezel}
          stroke="hsl(0 0% 0% / 0.18)"
          strokeWidth="0.5"
        />

        {/* 屏幕显示区 */}
        <rect
          x="22"
          y="10"
          width="76"
          height="44"
          rx="1.5"
          fill={screenBg}
        />

        {/* 屏幕反光高光 */}
        <path
          d="M22 12 L48 12 L34 36 L22 36 Z"
          fill="white"
          opacity="0.12"
        />

        {/* 屏幕底部反射条(让屏幕开关的"屏面"感更强) */}
        <rect
          x="22"
          y="51"
          width="76"
          height="3"
          fill="hsl(0 0% 0% / 0.2)"
        />

        {/* 摄像头小点 */}
        <circle cx="60" cy="8.5" r="0.5" fill="hsl(0 0% 0% / 0.5)" />

        {/* 中央标识 */}
        {badge && (
          <text
            x="60"
            y="35"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="14"
            fontWeight="700"
            fill="white"
            opacity="0.9"
            fontFamily="-apple-system, system-ui, sans-serif"
          >
            {badge}
          </text>
        )}

        {/* 底座(键盘部分) —— 透视梯形 */}
        <path
          d="M10 62 L110 62 L116 72 L4 72 Z"
          fill={accentStr}
          stroke="hsl(0 0% 0% / 0.2)"
          strokeWidth="0.5"
        />
        {/* 底座顶部高光 */}
        <rect x="10" y="62" width="100" height="1" fill="white" opacity="0.18" />

        {/* 键盘开口(暗色凹槽) */}
        <rect
          x="24"
          y="64"
          width="72"
          height="4"
          rx="0.8"
          fill="hsl(0 0% 0% / 0.4)"
        />
        {/* 触控板 */}
        <rect
          x="48"
          y="69"
          width="24"
          height="1.5"
          rx="0.4"
          fill="hsl(0 0% 0% / 0.25)"
        />
      </svg>
    </div>
  );
}

/**
 * 从品牌名提取 1-2 字符徽标。
 * 中文:取第一个字。英文:取首字母大写,最多 2 个字符。
 */
export function brandBadge(brand: string): string {
  const trimmed = brand.trim();
  if (!trimmed) return "";
  // 包含中文,取第一个汉字
  if (/[\u4e00-\u9fa5]/.test(trimmed)) {
    const cn = trimmed.match(/[\u4e00-\u9fa5]/);
    return cn ? cn[0] : trimmed[0];
  }
  // 英文:首字母大写,2 字符
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}
