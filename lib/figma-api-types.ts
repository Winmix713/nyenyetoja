// Figma API Type Definitions
export interface FigmaFileResponse {
  document: FigmaDocumentNode
  components: Record<string, FigmaComponent>
  componentSets: Record<string, FigmaComponentSet>
  schemaVersion: number
  styles: Record<string, FigmaStyle>
  name: string
  lastModified: string
  thumbnailUrl: string
  version: string
  role: string
  editorType: string
  linkAccess: string
}

export interface FigmaDocumentNode {
  id: string
  name: string
  type: "DOCUMENT"
  children: FigmaPageNode[]
}

export interface FigmaPageNode {
  id: string
  name: string
  type: "PAGE"
  children: FigmaFrameNode[]
  backgroundColor?: FigmaColor
  prototypeStartNodeID?: string
}

export interface FigmaFrameNode {
  id: string
  name: string
  type: "FRAME" | "COMPONENT" | "INSTANCE" | "GROUP"
  children?: FigmaNode[]
  backgroundColor?: FigmaColor
  absoluteBoundingBox: FigmaBoundingBox
  constraints?: FigmaConstraints
  layoutMode?: "NONE" | "HORIZONTAL" | "VERTICAL"
  primaryAxisSizingMode?: "FIXED" | "AUTO"
  counterAxisSizingMode?: "FIXED" | "AUTO"
  primaryAxisAlignItems?: "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN"
  counterAxisAlignItems?: "MIN" | "CENTER" | "MAX"
  paddingLeft?: number
  paddingRight?: number
  paddingTop?: number
  paddingBottom?: number
  itemSpacing?: number
  cornerRadius?: number | number[]
  fills?: FigmaFill[]
  strokes?: FigmaStroke[]
  strokeWeight?: number
  effects?: FigmaEffect[]
  exportSettings?: FigmaExportSetting[]
  blendMode?: string
  preserveRatio?: boolean
  layoutGrow?: number
  opacity?: number
  isMask?: boolean
  visible?: boolean
  componentId?: string
  componentProperties?: Record<string, any>
}

export interface FigmaTextNode {
  id: string
  name: string
  type: "TEXT"
  characters: string
  style: FigmaTextStyle
  characterStyleOverrides?: number[]
  styleOverrideTable?: Record<string, FigmaTextStyle>
  absoluteBoundingBox: FigmaBoundingBox
  constraints?: FigmaConstraints
  fills?: FigmaFill[]
  strokes?: FigmaStroke[]
  strokeWeight?: number
  effects?: FigmaEffect[]
  opacity?: number
  visible?: boolean
}

export interface FigmaVectorNode {
  id: string
  name: string
  type: "VECTOR" | "STAR" | "LINE" | "ELLIPSE" | "POLYGON" | "RECTANGLE"
  absoluteBoundingBox: FigmaBoundingBox
  constraints?: FigmaConstraints
  fills?: FigmaFill[]
  strokes?: FigmaStroke[]
  strokeWeight?: number
  strokeCap?: "NONE" | "ROUND" | "SQUARE" | "ARROW_LINES" | "ARROW_EQUILATERAL"
  strokeJoin?: "MITER" | "BEVEL" | "ROUND"
  cornerRadius?: number | number[]
  effects?: FigmaEffect[]
  opacity?: number
  visible?: boolean
}

export type FigmaNode = FigmaFrameNode | FigmaTextNode | FigmaVectorNode

export interface FigmaBoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface FigmaConstraints {
  vertical: "TOP" | "BOTTOM" | "CENTER" | "TOP_BOTTOM" | "SCALE"
  horizontal: "LEFT" | "RIGHT" | "CENTER" | "LEFT_RIGHT" | "SCALE"
}

export interface FigmaColor {
  r: number
  g: number
  b: number
  a: number
}

export interface FigmaFill {
  type: "SOLID" | "GRADIENT_LINEAR" | "GRADIENT_RADIAL" | "GRADIENT_ANGULAR" | "GRADIENT_DIAMOND" | "IMAGE"
  color?: FigmaColor
  opacity?: number
  gradientHandlePositions?: FigmaVector[]
  gradientStops?: FigmaColorStop[]
  scaleMode?: "FILL" | "FIT" | "CROP" | "TILE"
  imageTransform?: number[][]
  scalingFactor?: number
  rotation?: number
  imageRef?: string
  filters?: FigmaImageFilters
  visible?: boolean
  blendMode?: string
}

export interface FigmaStroke {
  type: "SOLID" | "GRADIENT_LINEAR" | "GRADIENT_RADIAL" | "GRADIENT_ANGULAR" | "GRADIENT_DIAMOND" | "IMAGE"
  color?: FigmaColor
  opacity?: number
  gradientHandlePositions?: FigmaVector[]
  gradientStops?: FigmaColorStop[]
}

export interface FigmaEffect {
  type: "INNER_SHADOW" | "DROP_SHADOW" | "LAYER_BLUR" | "BACKGROUND_BLUR"
  visible?: boolean
  radius: number
  color?: FigmaColor
  blendMode?: string
  offset?: FigmaVector
  spread?: number
  showShadowBehindNode?: boolean
}

export interface FigmaTextStyle {
  fontFamily: string
  fontPostScriptName?: string
  paragraphSpacing?: number
  paragraphIndent?: number
  listSpacing?: number
  italic?: boolean
  fontWeight: number
  fontSize: number
  textCase?: "ORIGINAL" | "UPPER" | "LOWER" | "TITLE"
  textDecoration?: "NONE" | "UNDERLINE" | "STRIKETHROUGH"
  textAutoResize?: "NONE" | "WIDTH_AND_HEIGHT" | "HEIGHT"
  textAlignHorizontal?: "LEFT" | "RIGHT" | "CENTER" | "JUSTIFIED"
  textAlignVertical?: "TOP" | "CENTER" | "BOTTOM"
  letterSpacing?: number
  lineHeightPx?: number
  lineHeightPercent?: number
  lineHeightPercentFontSize?: number
  lineHeightUnit?: "PIXELS" | "FONT_SIZE_%" | "INTRINSIC_%"
}

export interface FigmaVector {
  x: number
  y: number
}

export interface FigmaColorStop {
  position: number
  color: FigmaColor
}

export interface FigmaImageFilters {
  exposure?: number
  contrast?: number
  saturation?: number
  temperature?: number
  tint?: number
  highlights?: number
  shadows?: number
}

export interface FigmaComponent {
  key: string
  name: string
  description: string
  componentSetId?: string
  documentationLinks: FigmaDocumentationLink[]
}

export interface FigmaComponentSet {
  key: string
  name: string
  description: string
  documentationLinks: FigmaDocumentationLink[]
}

export interface FigmaStyle {
  key: string
  name: string
  description: string
  styleType: "FILL" | "TEXT" | "EFFECT" | "GRID"
}

export interface FigmaDocumentationLink {
  uri: string
}

export interface FigmaExportSetting {
  suffix: string
  format: "JPG" | "PNG" | "SVG" | "PDF"
  constraint: {
    type: "SCALE" | "WIDTH" | "HEIGHT"
    value: number
  }
}

export interface FigmaImagesResponse {
  images: Record<string, string>
  err?: string
}

export interface FigmaCommentsResponse {
  comments: FigmaComment[]
}

export interface FigmaComment {
  id: string
  file_key: string
  parent_id: string
  user: FigmaUser
  created_at: string
  resolved_at?: string
  message: string
  client_meta: FigmaVector
  order_id: string
}

export interface FigmaUser {
  id: string
  handle: string
  img_url: string
  email?: string
}

// Error Types
export enum FigmaApiErrorType {
  AUTHENTICATION_ERROR = "auth_error",
  RATE_LIMIT_ERROR = "rate_limit",
  FILE_NOT_FOUND = "file_not_found",
  NETWORK_ERROR = "network_error",
  PARSING_ERROR = "parsing_error",
  UNKNOWN_ERROR = "unknown_error",
}

export class FigmaApiError extends Error {
  constructor(
    public type: FigmaApiErrorType,
    message: string,
    public statusCode?: number,
    public retryAfter?: number,
  ) {
    super(message)
    this.name = "FigmaApiError"
  }
}

// Metrics and Performance Types
export interface FigmaApiMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  cacheHitRate: number
  rateLimitHits: number
  errorsByType: Record<FigmaApiErrorType, number>
  lastUpdated: Date
}

export interface RateLimitStats {
  requestsInWindow: number
  maxRequests: number
  windowMs: number
  nextResetTime: Date
}

export interface CacheStats {
  size: number
  maxSize: number
  hitRate: number
  missRate: number
  totalHits: number
  totalMisses: number
}

export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy"
  responseTime: number
  lastCheck: Date
  errors: string[]
}
