#!/bin/bash

echo "🚀 Starting Docker Compose services..."
docker-compose up -d

echo "⏳ Waiting for services to be healthy..."
sleep 10

echo "✅ Checking Kafka connection..."
docker exec nest-kafka kafka-broker-api-versions.sh --bootstrap-server localhost:9092

echo "✅ Checking PostgreSQL connection..."
docker exec nest-postgres pg_isready -U postgres

echo ""
echo "📋 Creating Kafka topics..."
docker exec nest-kafka kafka-topics.sh --create \
  --bootstrap-server localhost:9092 \
  --topic product.created \
  --partitions 3 \
  --replication-factor 1 \
  --if-not-exists

docker exec nest-kafka kafka-topics.sh --create \
  --bootstrap-server localhost:9092 \
  --topic product.updated \
  --partitions 3 \
  --replication-factor 1 \
  --if-not-exists

docker exec nest-kafka kafka-topics.sh --create \
  --bootstrap-server localhost:9092 \
  --topic product.deleted \
  --partitions 3 \
  --replication-factor 1 \
  --if-not-exists

echo ""
echo "📋 Listing Kafka topics..."
docker exec nest-kafka kafka-topics.sh --list --bootstrap-server localhost:9092

echo ""
echo "✅ Setup complete!"
echo ""
echo "🔗 Services available at:"
echo "   - PostgreSQL: localhost:5432"
echo "   - Kafka: localhost:9092"
echo ""
echo "📝 Next steps:"
echo "   1. Copy .env.example to .env"
echo "   2. Run: npm run start:dev"
echo ""
