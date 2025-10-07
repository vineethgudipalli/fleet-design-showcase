// Database configuration for GCP CloudSQL PostgreSQL

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  connectionLimit: number;
  timezone: string;
}

export interface AppConfig {
  environment: 'development' | 'staging' | 'production';
  port: number;
  jwtSecret: string;
  encryptionKey: string;
  figmaApiToken?: string;
}

// Environment-based configuration
export const config = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'fleet_showcase',
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
    timezone: 'UTC',
  } as DatabaseConfig,

  app: {
    environment: (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development',
    port: parseInt(process.env.PORT || '3000'),
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    encryptionKey: process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key!!',
    figmaApiToken: process.env.FIGMA_API_TOKEN,
  } as AppConfig,

  // Security settings
  security: {
    sessionExpiry: '24h',
    maxLoginAttempts: 5,
    lockoutDuration: 15, // minutes
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  },

  // Feature flags
  features: {
    enableRegistration: process.env.ENABLE_REGISTRATION === 'true',
    enablePublicAccess: process.env.ENABLE_PUBLIC_ACCESS !== 'false',
    enableComments: process.env.ENABLE_COMMENTS !== 'false',
    enableReactions: process.env.ENABLE_REACTIONS !== 'false',
    enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
  },
};

// Validation function for required environment variables
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required database config
  if (!config.database.host) errors.push('DB_HOST is required');
  if (!config.database.database) errors.push('DB_NAME is required');
  if (!config.database.username) errors.push('DB_USERNAME is required');

  // Check security config in production
  if (config.app.environment === 'production') {
    if (config.app.jwtSecret === 'your-super-secret-jwt-key-change-in-production') {
      errors.push('JWT_SECRET must be set in production');
    }
    if (config.app.encryptionKey === 'your-32-character-encryption-key!!') {
      errors.push('ENCRYPTION_KEY must be set in production');
    }
    if (!config.database.ssl) {
      errors.push('DB_SSL should be enabled in production');
    }
    if (!config.database.password) {
      errors.push('DB_PASSWORD is required in production');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Helper function to get database connection string
export function getDatabaseUrl(): string {
  const { host, port, database, username, password } = config.database;
  const auth = password ? `${username}:${password}` : username;
  return `postgresql://${auth}@${host}:${port}/${database}`;
}

// Environment file template for reference
export const envTemplate = `
# Database Configuration
DB_HOST=your-cloudsql-instance-ip
DB_PORT=5432
DB_NAME=fleet_showcase
DB_USERNAME=postgres
DB_PASSWORD=your-secure-password
DB_SSL=true
DB_CONNECTION_LIMIT=10

# Application Security
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
ENCRYPTION_KEY=your-32-character-encryption-key!!
NODE_ENV=production

# Optional: Global Figma API Token
FIGMA_API_TOKEN=figd_your_figma_token_here

# Feature Flags
ENABLE_REGISTRATION=false
ENABLE_PUBLIC_ACCESS=true
ENABLE_COMMENTS=true
ENABLE_REACTIONS=true
ENABLE_ANALYTICS=true

# CORS Configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Application Port
PORT=3000
`;

export default config;