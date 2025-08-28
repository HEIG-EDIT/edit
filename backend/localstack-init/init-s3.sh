#!/bin/bash

set -e

echo ">>> Waiting for LocalStack S3 to be ready..."

for i in {1..10}; do
  if awslocal s3 ls >/dev/null 2>&1; then
    echo ">>> S3 is ready!"
    break
  fi
  echo ">>> S3 not ready yet... retrying ($i/10)"
  sleep 2
done

echo ">>> Creating S3 bucket and seeding test objects..."

awslocal s3 mb s3://test-bucket || true

# Path to example thumbnail image
THUMBNAIL_PATH="/etc/localstack/assets/thumbnail.png"

# Desired dimensions for all thumbnails
WIDTH=200
HEIGHT=200

for projectId in 1 2 3 4 5 6 7 8 9; do
  # create a dummy project.json
  echo "{\"id\":$projectId,\"name\":\"Local Test Project $projectId\",\"status\":\"draft\"}" > /tmp/project.json
  
  cp "$THUMBNAIL_PATH" /tmp/thumbnail.png

  # upload to S3 under projectId/
  awslocal s3 cp /tmp/project.json s3://test-bucket/$projectId/project.json
  awslocal s3 cp /tmp/thumbnail.png s3://test-bucket/$projectId/thumbnail.png

  echo ">>> Uploaded project $projectId files"
done

echo ">>> S3 bucket and test objects created."
