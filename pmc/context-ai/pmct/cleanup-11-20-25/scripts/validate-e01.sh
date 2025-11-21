#!/bin/bash
set -e

echo "🔍 Phase 1: Type checking..."
npm run type-check

echo "🔍 Phase 2: Building..."
npm run build

echo "🔍 Phase 3: Counting remaining casts..."
CAST_COUNT=$(grep -rn "as any" src --include="*.ts" --include="*.tsx" \
  --exclude-dir="__tests__" | wc -l)
echo "Remaining non-test casts: $CAST_COUNT"

echo "✅ E01 validation complete!"
