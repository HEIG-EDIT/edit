#!/bin/bash

cd /home/ec2-user/server/frontend
pm2 start npm --name frontend -- run start -- -p 3000
