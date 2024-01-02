#!/bin/bash

# 환경 변수를 사용하여 config.toml 파일의 내용을 설정
cat <<EOL > ./config.toml
mongo-url = "mongodb://\$MONGO_INITDB_DATABASE_USERNAME:\$MONGO_INITDB_DATABASE_PASSWORD@mongo1:27017,mongo2:27017,mongo3:27017/\$MONGO_INITDB_DATABASE?replicaSet=\$REPLICA_NAME"
elasticsearch-urls = ["http://elasticsearch:9200"]
direct-read-namespaces = ["\$MONGO_INITDB_DATABASE.\$MONGO_INITDB_COLLECTION_NAME"]
dropped-collections = true
dropped-databases = true
resume = false
resume-write-unsafe = true
index-as-update = true
index-oplog-time = true
verbose = true
elasticsearch-max-seconds = 5
elasticsearch-max-bytes = 8000000
elasticsearch-user = "\$ELASTIC_USERNAME"
elasticsearch-password = "\$ELASTIC_PASSWORD"

[[script]]
script = '''
module.exports = function(doc, ns) {
    var newDoc = {
        _id: doc._id,
        name: doc.name,
        english_name: doc.english_name,
        serial_number: doc.serial_number,
        type: doc.type,
        company: doc.company,
        english_company: doc.english_company,
        permit_date: doc.permit_date,
        classification: doc.classification,
        state: doc.state,
        standard_code: doc.standard_code,
        ingredients: doc.ingredients,
        storage_method: doc.storage_method,
        expiration_date: doc.expiration_date,
        packing_unit: doc.packing_unit,
        insurance_code: doc.insurance_code,
        raw_material: doc.raw_material,
        total_amount: doc.total_amount,
        main_ingredient: doc.main_ingredient,
        additive: doc.additive,
        register_id: doc.register_id,
        cancel_date: doc.cancel_date,
        index: ns.replace(".", "-")
    };
    return newDoc;
};
'''
EOL

# 생성된 config.toml 파일 확인
cat ./config.toml
