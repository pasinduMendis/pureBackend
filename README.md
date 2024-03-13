# Pure PM Listing API

## Manual Deployment Commands with Gcloud CLI

### Step #1

```
gcloud builds submit --region=us-east1 --tag gcr.io/pure-marketing-368121/purepm-listing-api-v1
```

### Step #2

```
gcloud run deploy purepm-listing-api-v1 --image gcr.io/pure-marketing-368121/purepm-listing-api-v1 --region=us-east1 --service-account=purepm@pure-marketing-368121.iam.gserviceaccount.com --update-secrets=DATABASE_URL=DATABASE_URL:latest,AUTH0_CLIENT_ID=AUTH0_CLIENT_ID:latest,AUTH0_CLIENT_SECRET=AUTH0_CLIENT_SECRET:latest,AUTH0_DOMAIN=AUTH0_DOMAIN:latest,NODE_ENV=NODE_ENV:latest --allow-unauthenticated