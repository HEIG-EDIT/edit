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

# Path to example thumbnail images
ASSETS_DIR="/etc/localstack/assets"

# Desired dimensions for all thumbnails (not used yet, just informative)
WIDTH=200
HEIGHT=200

for projectId in {1..9}; do
  # create a dummy project.json
  echo "{\"id\":$projectId,\"name\":\"Local Test Project $projectId\",\"status\":\"draft\"}" > /tmp/project.json

  # Pick the image (cycles through 1, 2, 3)
  img_index=$(( (projectId - 1) % 3 + 1 ))
  THUMBNAIL_PATH="$ASSETS_DIR/image_${img_index}.png"

  # Copy the chosen thumbnail
  cp "$THUMBNAIL_PATH" /tmp/thumbnail.png

  # Upload to S3 under projectId/
  awslocal s3 cp /tmp/project.json s3://test-bucket/$projectId/project.json
  awslocal s3 cp /tmp/thumbnail.png s3://test-bucket/$projectId/thumbnail.png

  echo ">>> Uploaded project $projectId files with image_${img_index}.png"
done

echo ">>> S3 bucket and test objects created."
