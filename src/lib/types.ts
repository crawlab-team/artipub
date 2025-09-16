export interface Platform {
  id: string;
  name: string;
  displayName: string;
  color: string;
  icon: string;
  apiEndpoint?: string;
  authType: 'oauth' | 'api_key' | 'cookie' | 'manual';
  supportedFormats: string[];
  maxTitleLength: number;
  maxContentLength: number;
  supportsMarkdown: boolean;
  supportsHTML: boolean;
  categories: string[];
}

export interface Article {
  id: string;
  title: string;
  content: string;
  summary?: string;
  tags: string[];
  author: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'optimized' | 'published' | 'failed';
  platformVersions?: Record<string, {
    title: string;
    content: string;
    metadata: Record<string, unknown>;
  }>;
}

export interface PublishingTask {
  id: string;
  articleId: string;
  platforms: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results: Record<string, {
    status: 'success' | 'failed' | 'pending';
    url?: string;
    error?: string;
    publishedAt?: Date;
  }>;
  createdAt: Date;
  strategy?: import("./strategy-types").PublishingStrategy;
}

// Supported platforms configuration
export const PLATFORMS: Platform[] = [
  {
    id: 'zhihu',
    name: 'zhihu',
    displayName: '知乎',
    color: '#0066ff',
    icon: 'zhihu',
    authType: 'cookie',
    supportedFormats: ['markdown', 'html'],
    maxTitleLength: 100,
    maxContentLength: 50000,
    supportsMarkdown: true,
    supportsHTML: true,
    categories: ['技术', '编程', 'AI', '前端', '后端', '数据科学']
  },
  {
    id: 'juejin',
    name: 'juejin',
    displayName: '掘金',
    color: '#1e80ff',
    icon: 'juejin',
    authType: 'cookie',
    supportedFormats: ['markdown'],
    maxTitleLength: 80,
    maxContentLength: 100000,
    supportsMarkdown: true,
    supportsHTML: false,
    categories: ['前端', '后端', 'Android', 'iOS', '人工智能', '开发工具']
  },
  {
    id: 'csdn',
    name: 'csdn',
    displayName: 'CSDN',
    color: '#fc5531',
    icon: 'csdn',
    authType: 'cookie',
    supportedFormats: ['markdown', 'html'],
    maxTitleLength: 100,
    maxContentLength: 200000,
    supportsMarkdown: true,
    supportsHTML: true,
    categories: ['移动开发', 'Web开发', '数据库', '人工智能', '物联网']
  },
  {
    id: 'jianshu',
    name: 'jianshu',
    displayName: '简书',
    color: '#ea6f5a',
    icon: 'jianshu',
    authType: 'cookie',
    supportedFormats: ['markdown'],
    maxTitleLength: 100,
    maxContentLength: 50000,
    supportsMarkdown: true,
    supportsHTML: false,
    categories: ['编程', '技术', '前端开发', '后端开发', '移动开发']
  },
  {
    id: 'segmentfault',
    name: 'segmentfault',
    displayName: 'SegmentFault',
    color: '#009a61',
    icon: 'segmentfault',
    authType: 'cookie',
    supportedFormats: ['markdown'],
    maxTitleLength: 80,
    maxContentLength: 100000,
    supportsMarkdown: true,
    supportsHTML: false,
    categories: ['JavaScript', 'Python', 'Java', 'PHP', 'Go', 'React']
  },
  {
    id: 'oschina',
    name: 'oschina',
    displayName: '开源中国',
    color: '#428bca',
    icon: 'oschina',
    authType: 'cookie',
    supportedFormats: ['html'],
    maxTitleLength: 100,
    maxContentLength: 100000,
    supportsMarkdown: false,
    supportsHTML: true,
    categories: ['开源软件', 'Java', 'Python', 'C++', '前端', '后端']
  }
];

export const getPlatformById = (id: string): Platform | undefined => {
  return PLATFORMS.find(platform => platform.id === id);
};

export const getPlatformsByIds = (ids: string[]): Platform[] => {
  return PLATFORMS.filter(platform => ids.includes(platform.id));
};