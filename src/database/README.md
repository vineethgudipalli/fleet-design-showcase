# Database Setup for Fleet Design Showcase

This directory contains the database schema and configuration files for the Fleet Design Showcase platform using GCP CloudSQL PostgreSQL.

## Files

- `schema.sql` - Complete PostgreSQL database schema with tables, indexes, and initial data
- `README.md` - This setup guide

## GCP CloudSQL Setup

### 1. Create CloudSQL Instance

```bash
# Create a PostgreSQL instance in GCP
gcloud sql instances create fleet-showcase-db \
    --database-version=POSTGRES_14 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --storage-type=SSD \
    --storage-size=10GB \
    --backup-start-time=03:00 \
    --maintenance-window-day=SUN \
    --maintenance-window-hour=04 \
    --availability-type=zonal
```

### 2. Create Database and User

```bash
# Create the database
gcloud sql databases create fleet_showcase --instance=fleet-showcase-db

# Create a user (replace with your secure password)
gcloud sql users create fleet_admin \
    --instance=fleet-showcase-db \
    --password=YOUR_SECURE_PASSWORD
```

### 3. Configure Network Access

```bash
# Add your IP address for initial setup
gcloud sql instances patch fleet-showcase-db \
    --authorized-networks=YOUR_IP_ADDRESS/32

# For production, use private IP or VPC peering
gcloud sql instances patch fleet-showcase-db \
    --network=projects/YOUR_PROJECT/global/networks/YOUR_VPC \
    --no-assign-ip
```

### 4. Apply Database Schema

```bash
# Connect to the instance
gcloud sql connect fleet-showcase-db --user=fleet_admin --database=fleet_showcase

# In the PostgreSQL prompt, run:
\i schema.sql
```

Or using psql directly:

```bash
# Get connection details
gcloud sql instances describe fleet-showcase-db

# Connect with psql
psql "host=INSTANCE_IP port=5432 dbname=fleet_showcase user=fleet_admin password=YOUR_PASSWORD sslmode=require"

# Apply schema
\i schema.sql
```

## Environment Variables

Create a `.env` file in your project root with these variables:

```env
# Database Configuration
DB_HOST=YOUR_CLOUDSQL_INSTANCE_IP
DB_PORT=5432
DB_NAME=fleet_showcase
DB_USERNAME=fleet_admin
DB_PASSWORD=YOUR_SECURE_PASSWORD
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
```

## Database Schema Overview

### Core Tables

- **users** - User authentication and profiles
- **prototypes** - Design prototypes and their metadata
- **personas** - Fleet management roles (11 predefined personas)
- **experiences** - Design experience categories (6 categories)
- **reactions** - LinkedIn-style reactions (heart, like, idea)
- **comments** - Collaborative feedback system
- **system_settings** - Admin configuration storage

### Key Features

- **UUIDs** - All primary keys use UUID for better scalability
- **Timestamps** - Automatic created_at and updated_at tracking
- **Indexes** - Optimized for common query patterns
- **Triggers** - Auto-updating timestamps
- **Views** - Pre-computed popular and recent prototype queries
- **Constraints** - Data integrity and validation

### Security

- **Encrypted Storage** - Sensitive data like API tokens are marked for encryption
- **Audit Trail** - Activity logging for all user actions
- **Session Management** - Secure admin authentication
- **Role-based Access** - Admin vs user permissions

## Default Data

The schema includes:

### Personas (11 Fleet Management Roles)
- Fleet Manager
- Compliance Manager  
- Dispatcher
- Safety Manager
- Maintenance Manager
- Asset Manager
- IT Administrator
- Owner/Operator
- Driver
- Technician
- Sustainability Manager

### Experience Categories
- Discover - Exploration interfaces
- Onboard - User onboarding flows
- Shop - E-commerce features
- Core - Primary workflows
- Specialist - Advanced tools
- Support - Help and customer service

### Default Admin User
- Email: admin@fleet.com
- Role: admin
- (Password must be set separately)

## Production Considerations

### Security
- Change default admin credentials
- Use strong, unique passwords
- Enable SSL/TLS connections
- Set up VPC private networking
- Configure proper firewall rules
- Implement backup and recovery

### Performance
- Monitor connection pool usage
- Scale instance size as needed
- Consider read replicas for heavy read workloads
- Regular maintenance windows
- Query performance monitoring

### Backup Strategy
```bash
# Automated backups are enabled by default
# Manual backup example:
gcloud sql backups create --instance=fleet-showcase-db
```

### Monitoring
```bash
# View instance metrics
gcloud sql instances describe fleet-showcase-db

# View recent operations
gcloud sql operations list --instance=fleet-showcase-db
```

## Troubleshooting

### Connection Issues
1. Check firewall rules and authorized networks
2. Verify SSL settings match your configuration
3. Ensure database and user exist
4. Check instance status

### Performance Issues
1. Monitor CPU and memory usage
2. Check for long-running queries
3. Review connection pool settings
4. Consider upgrading instance tier

### Common Commands
```bash
# Instance status
gcloud sql instances describe fleet-showcase-db

# Connect to database
gcloud sql connect fleet-showcase-db --user=fleet_admin

# View logs
gcloud sql instances describe fleet-showcase-db --format="value(settings.ipConfiguration.authorizedNetworks)"

# Restart instance
gcloud sql instances restart fleet-showcase-db
```

For more details, see the [GCP CloudSQL documentation](https://cloud.google.com/sql/docs/postgres/).