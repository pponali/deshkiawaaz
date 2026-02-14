#!/bin/bash
# Script to inject environment variables into environment.prod.ts before production build

TEMPLATE_FILE="src/environments/environment.prod.ts.template"
ENV_FILE="src/environments/environment.prod.ts"

# Copy template to actual file
cp "$TEMPLATE_FILE" "$ENV_FILE"

# Check if required env vars are set
required_vars=(
  "FIREBASE_API_KEY"
  "FIREBASE_AUTH_DOMAIN"
  "FIREBASE_PROJECT_ID"
  "FIREBASE_STORAGE_BUCKET"
  "FIREBASE_MESSAGING_SENDER_ID"
  "FIREBASE_APP_ID"
  "GEMINI_API_KEY"
)

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "Warning: $var is not set"
  fi
done

# Replace placeholders with actual values
sed -i "s|\${FIREBASE_API_KEY}|${FIREBASE_API_KEY:-}|g" $ENV_FILE
sed -i "s|\${FIREBASE_AUTH_DOMAIN}|${FIREBASE_AUTH_DOMAIN:-}|g" $ENV_FILE
sed -i "s|\${FIREBASE_DATABASE_URL}|${FIREBASE_DATABASE_URL:-}|g" $ENV_FILE
sed -i "s|\${FIREBASE_PROJECT_ID}|${FIREBASE_PROJECT_ID:-}|g" $ENV_FILE
sed -i "s|\${FIREBASE_STORAGE_BUCKET}|${FIREBASE_STORAGE_BUCKET:-}|g" $ENV_FILE
sed -i "s|\${FIREBASE_MESSAGING_SENDER_ID}|${FIREBASE_MESSAGING_SENDER_ID:-}|g" $ENV_FILE
sed -i "s|\${FIREBASE_APP_ID}|${FIREBASE_APP_ID:-}|g" $ENV_FILE
sed -i "s|\${FIREBASE_MEASUREMENT_ID}|${FIREBASE_MEASUREMENT_ID:-}|g" $ENV_FILE
sed -i "s|\${GEMINI_API_KEY}|${GEMINI_API_KEY:-}|g" $ENV_FILE

echo "Environment variables injected into $ENV_FILE"
