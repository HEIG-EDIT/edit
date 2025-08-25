set -e

echo ">>> Creating S3 bucket and seeding test objects..."

awslocal s3 mb s3://test-bucket || true

# Path to example thumbnail image
THUMBNAIL_PATH="./thumbnail.png"

# Desired dimensions for all thumbnails
WIDTH=200
HEIGHT=200

for projectId in 1 2 3 4 5 6 7 8 9; do
  # create a dummy project.json
  echo "{\"id\":$projectId,\"name\":\"Local Test Project $projectId\",\"status\":\"draft\"}" > /tmp/project.json
  
  # resize the thumbnail to consistent dimensions
  convert "$THUMBNAIL_PATH" -resize ${WIDTH}x${HEIGHT}^ -gravity center -extent ${WIDTH}x${HEIGHT} /tmp/thumbnail.png

  # upload to S3 under projectId/
  awslocal s3 cp /tmp/project.json s3://test-bucket/$projectId/project.json
  awslocal s3 cp /tmp/thumbnail.png s3://test-bucket/$projectId/thumbnail.png

  echo ">>> Uploaded project $projectId files"
done

echo ">>> S3 bucket and test objects created."
