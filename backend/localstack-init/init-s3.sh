set -e

echo ">>> Creating S3 bucket and seeding test objects..."

awslocal s3 mb s3://test-bucket || true

for projectId in 1 2 3; do
  # create a dummy project.json
  echo "{\"id\":$projectId,\"name\":\"Local Test Project $projectId\",\"status\":\"draft\"}" > /tmp/project.json
  
  # create a dummy thumbnail.png (just a text file for testing)
  echo "This is a fake thumbnail for project $projectId" > /tmp/thumbnail.png
  
  # upload to S3 under projectId/
  awslocal s3 cp /tmp/project.json s3://test-bucket/$projectId/project.json
  awslocal s3 cp /tmp/thumbnail.png s3://test-bucket/$projectId/thumbnail.png

  echo ">>> Uploaded project $projectId files"
done

echo ">>> S3 bucket and test objects created."
