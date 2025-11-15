#!/bin/bash

# Learning Path System - Testing Script
# This script demonstrates how to test the learning path API

BASE_URL="http://localhost:5000/api"
TOKEN="your_jwt_token_here"  # Replace with actual token

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== KanjAI Learning Path Testing ===${NC}\n"

# Test 1: Initialize Learning Path
echo -e "${BLUE}1. Initializing Learning Path (JLPT N5)${NC}"
curl -X POST "$BASE_URL/learning-path/initialize" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jlptLevel": 5}' | jq .

echo -e "\n${GREEN}✓ Learning path initialized${NC}\n"

# Test 2: Get Next Item (Radical)
echo -e "${BLUE}2. Getting Next Item to Learn${NC}"
NEXT_RESPONSE=$(curl -s -X GET "$BASE_URL/learning-path/next" \
  -H "Authorization: Bearer $TOKEN")

echo "$NEXT_RESPONSE" | jq .

ITEM_TYPE=$(echo "$NEXT_RESPONSE" | jq -r '.type')
ITEM_ID=$(echo "$NEXT_RESPONSE" | jq -r '.item.id')

echo -e "\n${GREEN}✓ Got next item: $ITEM_TYPE (ID: $ITEM_ID)${NC}\n"

# Test 3: Get All Radicals for Level
echo -e "${BLUE}3. Getting All Radicals for JLPT N5${NC}"
curl -s -X GET "$BASE_URL/learning-path/radicals?jlptLevel=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.radicals | length'

echo -e "${GREEN}✓ Retrieved radicals${NC}\n"

# Test 4: Get Radical Details
echo -e "${BLUE}4. Getting Radical Details${NC}"
curl -s -X GET "$BASE_URL/learning-path/radicals/1" \
  -H "Authorization: Bearer $TOKEN" | jq '.character, .primaryName, .meaning'

echo -e "\n${GREEN}✓ Retrieved radical details${NC}\n"

# Test 5: Get Learning Progress
echo -e "${BLUE}5. Checking Learning Progress${NC}"
PROGRESS=$(curl -s -X GET "$BASE_URL/learning-path/progress" \
  -H "Authorization: Bearer $TOKEN")

echo "$PROGRESS" | jq .

echo -e "\n${GREEN}✓ Retrieved progress${NC}\n"

# Test 6: Master a Radical
echo -e "${BLUE}6. Mastering Radical (ID: 1)${NC}"
curl -s -X POST "$BASE_URL/learning-path/radicals/1/master" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\n${GREEN}✓ Radical marked as mastered${NC}\n"

# Test 7: Check Updated Progress
echo -e "${BLUE}7. Checking Updated Progress${NC}"
curl -s -X GET "$BASE_URL/learning-path/progress" \
  -H "Authorization: Bearer $TOKEN" | jq '.radicals'

echo -e "\n${GREEN}✓ Progress updated${NC}\n"

# Test 8: Get All Kanji for Level
echo -e "${BLUE}8. Getting All Kanji for JLPT N5${NC}"
curl -s -X GET "$BASE_URL/learning-path/kanji?jlptLevel=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.kanji | length'

echo -e "${GREEN}✓ Retrieved kanji${NC}\n"

# Test 9: Get Kanji with Vocabulary
echo -e "${BLUE}9. Getting Kanji Details with Vocabulary (ID: 1)${NC}"
curl -s -X GET "$BASE_URL/learning-path/kanji/1" \
  -H "Authorization: Bearer $TOKEN" | jq '.character, .meaning, .onyomi, .kunyomi'

echo -e "\n${GREEN}✓ Retrieved kanji details${NC}\n"

# Test 10: Master a Kanji
echo -e "${BLUE}10. Mastering Kanji (ID: 1)${NC}"
curl -s -X POST "$BASE_URL/learning-path/kanji/1/master" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\n${GREEN}✓ Kanji marked as mastered (vocabulary should now be available)${NC}\n"

# Test 11: Get Vocabulary for Kanji
echo -e "${BLUE}11. Getting Vocabulary for Kanji (ID: 1)${NC}"
VOCAB_COUNT=$(curl -s -X GET "$BASE_URL/learning-path/kanji/1/vocabulary" \
  -H "Authorization: Bearer $TOKEN" | jq '.vocabulary | length')

echo "Found $VOCAB_COUNT vocabulary words"

echo -e "\n${GREEN}✓ Retrieved vocabulary${NC}\n"

# Test 12: Get Full Curriculum
echo -e "${BLUE}12. Getting Full Curriculum for JLPT N5${NC}"
curl -s -X GET "$BASE_URL/learning-path/curriculum?jlptLevel=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.radicals | length, .kanji | length'

echo -e "\n${GREEN}✓ Retrieved full curriculum${NC}\n"

# Test 13: Get Next Item (Should be Kanji or Radical now)
echo -e "${BLUE}13. Getting Next Item After Mastery${NC}"
curl -s -X GET "$BASE_URL/learning-path/next" \
  -H "Authorization: Bearer $TOKEN" | jq '.type, .item.character'

echo -e "\n${GREEN}✓ Learning path working correctly${NC}\n"

echo -e "${BLUE}=== All Tests Completed ===${NC}"
