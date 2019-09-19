#!/usr/bin/env bash

# replace original url to new one
if [ "${ARTIPUB_API_ADDRESS}" = "" ];
then
	:
else
	jspath=`ls /frontend/umi.*.js`
	sed -i "s?localhost:3000?${ARTIPUB_API_ADDRESS}?g" ${jspath}
fi

# start frontend
nginx -s stop | true
nginx

# start backend
npm run start:backend
