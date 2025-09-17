#!/bin/bash

# Ensure environment variables are loaded
source ~/.bashrc
git pull  
pm2 restart 8
cd MayaIQ_F-main
npm run build
cd ..
cd MayaIQ_W-main
npm run build
cd ..

pm2 restart 9
pm2 restart 10