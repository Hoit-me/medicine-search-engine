// 'admin' 데이터베이스로 전환
db = db.getSiblingDB("admin");

try {
  db.createUser({
    user: process.env.MONGO_INITDB_DATABASE_USERNAME,
    pwd: process.env.MONGO_INITDB_DATABASE_PASSWORD,
    roles: [
      {
        role: "readWrite",
        db: process.env.MONGO_INITDB_DATABASE,
      },
    ],
  });
} catch (e) {
  print("Error creating user :", e);
}

// 'hoit' 데이터베이스로 전환
db = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE);

// 'hoit' 데이터베이스에 medicine 컬렉션 생성
db.createCollection(process.env.MONGO_INITDB_COLLECTION_NAME);
db.createUser({
  user: process.env.MONGO_INITDB_DATABASE_USERNAME,
  pwd: process.env.MONGO_INITDB_DATABASE_PASSWORD,
  roles: [
    {
      role: "readWrite",
      db: process.env.MONGO_INITDB_DATABASE,
    },
  ],
});
// medicine 컬렉션에 데이터 추가
