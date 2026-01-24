#!/bin/bash

# 1. Find the running pod name in the 'ether' namespace
POD=$(kubectl get pod -n ether -l app=ether-website -o jsonpath="{.items[0].metadata.name}")

if [ -z "$POD" ]; then
  echo "❌ Error: No running pod found for ether-website."
  exit 1
fi

echo "⬇️  Downloading database from pod: $POD..."

# 2. Copy the file from the pod to your local directory
kubectl cp -n ether "$POD":/data/visitors.sqlite ./visitors_prod.sqlite

echo "✅ Done! Opened ./visitors_prod.sqlite"
echo "💡 Open this file in TablePlus to view your production data."
