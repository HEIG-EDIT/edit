#!/bin/bash

cd frontend
pm2 start npm --name frontend -- run start -- -p 3000
