#!/bin/bash

# MongoDB 키 파일 경로 설정
KEY_FILE="./mongo/mongodb.key"

# 키 파일이 없다면 생성
if [ ! -f "$KEY_FILE" ]; then
    echo "MongoDB 키 파일이 없습니다. 생성 중..."
    openssl rand -base64 756 > "$KEY_FILE"
    chmod 400 "$KEY_FILE"
fi

