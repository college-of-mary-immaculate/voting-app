#!/bin/bash

echo "Waiting for master..."

until mysqladmin ping -h db-master -uroot -prootpass --silent; do
  sleep 5
done

echo "Master is ready. Configuring replication..."

mysql -uroot -prootpass <<EOF
STOP REPLICA;

CHANGE REPLICATION SOURCE TO
  SOURCE_HOST='db-master',
  SOURCE_USER='replica',
  SOURCE_PASSWORD='replica_pass',
  SOURCE_AUTO_POSITION=1,
  GET_SOURCE_PUBLIC_KEY=1;

START REPLICA;
EOF

echo "Replication started."